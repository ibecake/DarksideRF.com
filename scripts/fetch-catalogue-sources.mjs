import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

// Download the SatNOGS lists and CelesTrak GP groups that build-catalogue.mjs reads.
// A required group must succeed. An optional group that fails is marked Invalid and skipped.

const cache = process.argv[2] ?? "/tmp";
mkdirSync(cache, { recursive: true });
const agent = "DarksideRF-catalogue/1.0 (https://github.com/ibecake/DarksideRF.com)";
const groups = [
  "active", "amateur", "weather", "science", "stations", "cubesat", "satnogs",
  "education", "resource", "dmc", "visual", "analyst", "engineering", "geodetic",
  "military", "radar", "argos", "sarsat", "other-comm", "x-comm",
];
const required = new Set(["active", "amateur", "weather", "satnogs", "cubesat"]);

async function download(url) {
  const response = await fetch(url, { headers: { "User-Agent": agent, Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const text = await response.text();
  return text.endsWith("\n") ? text : `${text}\n`;
}

function save(name, text) {
  writeFileSync(`${cache}/${name}`, text);
}

let failedRequired = false;
const transmitters = await download("https://db.satnogs.org/api/transmitters/?format=json&status=active");
const transmitterRows = JSON.parse(transmitters);
if (!Array.isArray(transmitterRows) || transmitterRows.length < 100) throw new Error("SatNOGS transmitter list is incomplete");
save("satnogs-tx.json", transmitters);
console.log(`transmitters ${transmitterRows.length}`);

const satelliteDump = await download("https://db.satnogs.org/api/satellites/?format=json");
const satelliteRows = JSON.parse(satelliteDump);
if (!Array.isArray(satelliteRows) || satelliteRows.length < 100) throw new Error("SatNOGS satellite list is incomplete");
save("satnogs-sats.json", satelliteDump);
console.log(`satellites ${satelliteRows.length}`);

let saved = 0;
for (const group of groups) {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(group)}&FORMAT=json`;
  try {
    const text = await download(url);
    const rows = JSON.parse(text);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("empty element set");
    save(`gp-${group}.json`, text);
    saved += 1;
    console.log(`${group} ${rows.length}`);
  } catch (error) {
    console.error(`${group} FAIL ${error instanceof Error ? error.message : error}`);
    save(`gp-${group}.json`, "Invalid\n");
    if (required.has(group)) failedRequired = true;
  }
  await delay(2000);
}

if (failedRequired || saved < 8) {
  console.error(`Refusing to rebuild. Saved ${saved} of ${groups.length} element groups.`);
  process.exit(1);
}
console.log(`saved ${saved} element groups`);
