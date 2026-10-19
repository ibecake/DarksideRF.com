import { readFileSync, writeFileSync } from "node:fs";

// Rebuild src/data/catalogue.json from a SatNOGS transmitter dump and CelesTrak GP group files.
// Frequencies come from SatNOGS records with status=active and a downlink. Unconfirmed records are dropped.
// A satellite is included only when one of the cached GP groups still has an element set for it.
// The original curated satellites keep their hand-checked transmitter lists and summaries.

const cache = process.argv[2] ?? "/tmp";
const groups = [
  "active", "amateur", "weather", "science", "stations", "cubesat", "satnogs",
  "education", "resource", "dmc", "visual", "analyst", "engineering", "geodetic",
  "military", "radar", "argos", "sarsat", "other-comm", "x-comm",
];

const transmitters = JSON.parse(readFileSync(`${cache}/satnogs-tx.json`, "utf8"))
  .filter((item) => item.status === "active" && item.downlink_low && item.norad_cat_id && !item.unconfirmed);
const satRecords = JSON.parse(readFileSync(`${cache}/satnogs-sats.json`, "utf8"));
const previous = JSON.parse(readFileSync(new URL("../src/data/catalogue.json", import.meta.url), "utf8"));

const orbits = new Map();
for (const group of groups) {
  const raw = readFileSync(`${cache}/gp-${group}.json`, "utf8");
  if (raw.startsWith("Invalid")) continue;
  for (const orbit of JSON.parse(raw)) {
    if (!orbits.has(orbit.NORAD_CAT_ID)) orbits.set(orbit.NORAD_CAT_ID, orbit);
  }
}

const byNorad = new Map(satRecords.filter((item) => item.norad_cat_id).map((item) => [item.norad_cat_id, item]));

function resolveNorad(norad) {
  if (orbits.has(norad)) return norad;
  const record = byNorad.get(norad);
  if (record?.norad_follow_id && orbits.has(record.norad_follow_id)) return record.norad_follow_id;
  return null;
}

function citationFor(item) {
  const raw = String(item.citation ?? "").trim();
  const url = raw.match(/https?:\/\/[^\s)]+/i)?.[0];
  if (url && !/citation needed|xkcd\.com|unconfirmed/i.test(raw)) return url;
  return `https://db.satnogs.org/satellite/${item.sat_id}/`;
}

function ommFrom(orbit) {
  return {
    OBJECT_NAME: orbit.OBJECT_NAME,
    OBJECT_ID: orbit.OBJECT_ID,
    EPOCH: orbit.EPOCH,
    MEAN_MOTION: orbit.MEAN_MOTION,
    ECCENTRICITY: orbit.ECCENTRICITY,
    INCLINATION: orbit.INCLINATION,
    RA_OF_ASC_NODE: orbit.RA_OF_ASC_NODE,
    ARG_OF_PERICENTER: orbit.ARG_OF_PERICENTER,
    MEAN_ANOMALY: orbit.MEAN_ANOMALY,
    NORAD_CAT_ID: orbit.NORAD_CAT_ID,
    BSTAR: orbit.BSTAR ?? 0,
    MEAN_MOTION_DOT: orbit.MEAN_MOTION_DOT ?? 0,
    MEAN_MOTION_DDOT: orbit.MEAN_MOTION_DDOT ?? 0,
    EPHEMERIS_TYPE: orbit.EPHEMERIS_TYPE ?? 0,
    CLASSIFICATION_TYPE: orbit.CLASSIFICATION_TYPE ?? "U",
    ELEMENT_SET_NO: orbit.ELEMENT_SET_NO ?? 999,
    REV_AT_EPOCH: orbit.REV_AT_EPOCH ?? 0,
  };
}

function categoryFor(name, record, items) {
  const services = items.map((item) => item.service || "");
  const modes = items.map((item) => item.mode).filter(Boolean);
  if (services.includes("Meteorological") || /NOAA|METEOR-M|METOP/i.test(name)) return "weather";
  if (modes.length > 0 && modes.every((mode) => mode === "SSTV")) return "sstv";
  if (services.includes("Amateur")) return "amateur";
  if (record?.status === "re-entered") return "historical";
  return "experimental";
}

const grouped = new Map();
for (const item of transmitters) {
  const norad = resolveNorad(item.norad_cat_id);
  if (!norad) continue;
  const key = `${Math.round(item.downlink_low / 1000)}|${item.mode ?? ""}`;
  if (!grouped.has(norad)) grouped.set(norad, new Map());
  const existing = grouped.get(norad).get(key);
  const betterCitation = citationFor(item).includes("db.satnogs.org") ? 0 : 1;
  const existingCitation = existing && !citationFor(existing).includes("db.satnogs.org") ? 1 : 0;
  if (!existing || betterCitation > existingCitation) grouped.get(norad).set(key, item);
}

const preserved = new Map(previous.satellites.map((satellite) => [satellite.norad, satellite]));
const usedIds = new Set(previous.satellites.map((satellite) => satellite.id));

function slug(name, norad) {
  const base = name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "sat";
  let id = usedIds.has(base) ? `${base}-${norad}` : base;
  if (usedIds.has(id)) id = `sat-${norad}`;
  usedIds.add(id);
  return id;
}

function recordFor(norad) {
  return byNorad.get(norad) ?? satRecords.find((item) => item.norad_follow_id === norad);
}

const satellites = [];
for (const [norad, items] of grouped) {
  const orbit = orbits.get(norad);
  const kept = preserved.get(norad);
  if (kept) {
    satellites.push({ ...kept, name: kept.name, cospar: orbit.OBJECT_ID || kept.cospar, omm: ommFrom(orbit) });
    continue;
  }
  const record = recordFor(norad);
  const list = [...items.values()];
  const name = orbit.OBJECT_NAME;
  const aliases = [...new Set([record?.name, ...(record?.names ? String(record.names).split(",") : [])]
    .map((item) => String(item ?? "").trim())
    .filter((item) => item && item.toLowerCase() !== name.toLowerCase()))];
  satellites.push({
    id: slug(name, norad),
    norad,
    name,
    cospar: orbit.OBJECT_ID,
    aliases,
    operator: record?.operator && record.operator !== "None" ? record.operator : "Listed by SatNOGS",
    category: categoryFor(name, record, list),
    status: record?.status === "re-entered" ? "historical" : "operational",
    zombie: false,
    summary: `${name} has ${list.length} active downlink ${list.length === 1 ? "record" : "records"} in SatNOGS. The frequencies are those records. A predicted pass only says the satellite is above the horizon.`,
    omm: ommFrom(orbit),
    transmitters: list
      .sort((a, b) => a.downlink_low - b.downlink_low)
      .map((item) => ({
        id: item.uuid,
        downlinkHz: Math.round(item.downlink_low),
        downlinkHighHz: item.downlink_high && Math.abs(item.downlink_high - item.downlink_low) > 500 ? Math.round(item.downlink_high) : null,
        mode: item.mode,
        baud: typeof item.baud === "number" ? item.baud : null,
        description: item.description || item.service || "Active SatNOGS downlink",
        service: item.service || null,
        alive: Boolean(item.alive),
        status: "active",
        updated: item.updated,
        citation: citationFor(item),
      })),
  });
}

for (const satellite of previous.satellites) {
  if (!satellites.some((item) => item.norad === satellite.norad)) satellites.push(satellite);
}

satellites.sort((a, b) => a.name.localeCompare(b.name));

const file = {
  retrievedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  orbitSource: "https://celestrak.org/NORAD/elements/gp.php",
  transmitterSource: "https://db.satnogs.org/api/transmitters/?status=active",
  satellites,
};

writeFileSync(new URL("../src/data/catalogue.json", import.meta.url), `${JSON.stringify(file, null, 2)}\n`);
console.log(`satellites ${satellites.length} transmitters ${satellites.reduce((sum, item) => sum + item.transmitters.length, 0)}`);
