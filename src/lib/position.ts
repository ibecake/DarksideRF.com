import { degreesToRadians, ecfToLookAngles, eciToEcf, eciToGeodetic, gstime, json2satrec, propagate, radiansToDegrees } from "satellite.js";
import type { Satellite } from "../types";

export interface SatelliteFix {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  azimuth: number;
  elevation: number;
}

const records = new Map<string, ReturnType<typeof json2satrec>>();

function recordFor(satellite: Satellite) {
  const cached = records.get(satellite.id);
  if (cached) return cached;
  const created = json2satrec(satellite.omm as Parameters<typeof json2satrec>[0]);
  records.set(satellite.id, created);
  return created;
}

export function whereSatellites(
  satellites: Satellite[],
  date: Date,
  latitude: number,
  longitude: number,
  heightKm: number,
): SatelliteFix[] {
  const observer = {
    longitude: degreesToRadians(longitude),
    latitude: degreesToRadians(latitude),
    height: heightKm,
  };
  const gmst = gstime(date);
  const fixes: SatelliteFix[] = [];
  for (const satellite of satellites) {
    try {
      const predicted = propagate(recordFor(satellite), date, { communityDecayCheckEnabled: true });
      if (!predicted || typeof predicted.position !== "object") continue;
      const geodetic = eciToGeodetic(predicted.position, gmst);
      const ecf = eciToEcf(predicted.position, gmst);
      const look = ecfToLookAngles(observer, ecf);
      let lon = radiansToDegrees(geodetic.longitude);
      if (lon > 180) lon -= 360;
      fixes.push({
        id: satellite.id,
        name: satellite.name,
        latitude: radiansToDegrees(geodetic.latitude),
        longitude: lon,
        altitudeKm: geodetic.height,
        azimuth: (radiansToDegrees(look.azimuth) + 360) % 360,
        elevation: radiansToDegrees(look.elevation),
      });
    } catch {
      // A bad element set drops that satellite from the map.
    }
  }
  return fixes;
}
