import { readFileSync, writeFileSync } from "node:fs";

const catalogue = JSON.parse(readFileSync(new URL("../src/data/catalogue.json", import.meta.url), "utf8"));
const jeLines = readFileSync("/tmp/je9pel.csv", "utf8").split(/\r?\n/).filter(Boolean);
const summary = JSON.parse(readFileSync("/tmp/amsat-summary.json", "utf8")).data;
const r4uab = readFileSync("/tmp/r4uab-frequency.txt", "utf8");

function mhzList(text) {
  if (!text || text === "." || text === "-") return [];
  const out = [];
  for (const part of text.split("/")) {
    const match = part.replace("*", "").trim().match(/(\d+(?:\.\d+)?)/);
    if (!match) continue;
    const value = Number(match[1]);
    if (value > 0 && value < 100000) out.push(value);
  }
  return out;
}

function compact(value) {
  return String(value || "").toLowerCase().replace(/\[[^\]]*\]/g, " ").replace(/[^a-z0-9]+/g, "");
}

const byNorad = new Map();
const aliasIndex = new Map();
for (const satellite of catalogue.satellites) {
  const freqs = new Set(satellite.transmitters.map((item) => Math.round(item.downlinkHz / 1000)));
  byNorad.set(satellite.norad, { satellite, freqs });
  for (const key of [satellite.name, satellite.id, ...satellite.aliases]) {
    const token = compact(key);
    if (token.length >= 2 && !aliasIndex.has(token)) aliasIndex.set(token, satellite);
  }
}

const jeRows = jeLines.map((line) => {
  const parts = line.split(";");
  return {
    name: parts[0] || "",
    norad: parts[1] || "",
    downlink: parts[3] || "",
    beacon: parts[4] || "",
    mode: parts[5] || "",
    status: (parts[7] || "").trim().toLowerCase(),
  };
});

const active = jeRows.filter((row) => row.status === "active" && /^\d+$/.test(row.norad));
const missingByNorad = new Map();
const extra = [];
for (const row of active) {
  const norad = Number(row.norad);
  const known = byNorad.get(norad);
  const published = [...mhzList(row.downlink), ...mhzList(row.beacon)];
  if (!known) {
    if (!missingByNorad.has(norad) && published.length) {
      missingByNorad.set(norad, {
        norad,
        name: row.name,
        mhz: published[0],
        mode: row.mode,
      });
    }
    continue;
  }
  for (const mhz of published) {
    const khz = Math.round(mhz * 1000);
    let found = false;
    for (const have of known.freqs) {
      if (Math.abs(have - khz) <= 5) found = true;
    }
    if (!found) {
      extra.push({
        norad,
        name: known.satellite.name,
        satelliteId: known.satellite.id,
        je9pelName: row.name,
        mhz,
        mode: row.mode,
      });
    }
  }
}

const heard = [];
for (const row of summary) {
  if (!["Heard", "Telemetry Only", "Crew Active"].includes(row.report)) continue;
  const label = String(row.satellite_display_name || row.name || "").replace(/\[[^\]]*\]/g, " ");
  const satellite = aliasIndex.get(compact(label));
  if (!satellite) continue;
  const latest = row.latest_reported_time;
  const current = heard.find((item) => item.satelliteId === satellite.id);
  if (current && current.latest >= latest) continue;
  const next = {
    satelliteId: satellite.id,
    report: row.report,
    latest,
    count: row.report_count,
    amsatName: label.trim(),
  };
  if (current) Object.assign(current, next);
  else heard.push(next);
}
heard.sort((a, b) => b.latest.localeCompare(a.latest));

const r4uabNorads = new Set();
for (const match of r4uab.matchAll(/\|\s*(\d{3,6})\s*\|/g)) r4uabNorads.add(Number(match[1]));
let r4uabOutside = 0;
for (const norad of r4uabNorads) if (!byNorad.has(norad)) r4uabOutside += 1;

const activity = {
  retrievedAt: "2026-10-20T05:50:00Z",
  je9pelUrl: "https://www.ne.jp/asahi/hamradio/je9pel/satslist.htm",
  amsatUrl: "https://www.amsat.org/status/api/v1/summary.php?hours=720",
  r4uabFrequencyUrl: "https://r4uab.ru/frequency/",
  r4uabFrequencyDated: "2021-10-16",
  r4uabRows: r4uabNorads.size,
  r4uabOutside,
  heard,
  je9pelActiveMissing: [...missingByNorad.values()].sort((a, b) => a.name.localeCompare(b.name)),
  je9pelExtraOnTracked: extra.sort((a, b) => a.name.localeCompare(b.name) || a.mhz - b.mhz),
};

writeFileSync(new URL("../src/data/activity.json", import.meta.url), `${JSON.stringify(activity, null, 2)}\n`);
console.log(JSON.stringify({
  heard: heard.length,
  missing: activity.je9pelActiveMissing.length,
  extra: extra.length,
  r4uab: r4uabNorads.size,
  r4uabOutside,
}, null, 2));
