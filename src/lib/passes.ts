import {
  degreesToRadians,
  dopplerFactor,
  ecfToLookAngles,
  eciToEcf,
  geodeticToEcf,
  gstime,
  json2satrec,
  propagate,
  radiansToDegrees,
} from "satellite.js";
import type { PassPrediction, Satellite } from "../types";

interface Look {
  elevation: number;
  azimuth: number;
  doppler: number;
}

function sample(satrec: ReturnType<typeof json2satrec>, date: Date, observer: { longitude: number; latitude: number; height: number }): Look | null {
  const predicted = propagate(satrec, date, { communityDecayCheckEnabled: true });
  if (!predicted || typeof predicted.position !== "object" || typeof predicted.velocity !== "object") return null;
  const gmst = gstime(date);
  const positionEcf = eciToEcf(predicted.position, gmst);
  const velocityEcf = eciToEcf(predicted.velocity, gmst);
  const angles = ecfToLookAngles(observer, positionEcf);
  return {
    elevation: radiansToDegrees(angles.elevation),
    azimuth: (radiansToDegrees(angles.azimuth) + 360) % 360,
    doppler: dopplerFactor(geodeticToEcf(observer), positionEcf, velocityEcf),
  };
}

function refineCrossing(
  satrec: ReturnType<typeof json2satrec>,
  observer: { longitude: number; latitude: number; height: number },
  earlier: Date,
  later: Date,
  minElevation: number,
  wantAbove: boolean,
): Date {
  let low = earlier.getTime();
  let high = later.getTime();
  for (let step = 0; step < 18; step += 1) {
    const mid = new Date((low + high) / 2);
    const look = sample(satrec, mid, observer);
    const above = Boolean(look && look.elevation >= minElevation);
    if (above === wantAbove) high = mid.getTime();
    else low = mid.getTime();
  }
  return new Date(high);
}

export function predictPasses(
  satellite: Satellite,
  start: Date,
  end: Date,
  latitude: number,
  longitude: number,
  heightKm: number,
  minElevation: number,
): PassPrediction[] {
  const satrec = json2satrec(satellite.omm as Parameters<typeof json2satrec>[0]);
  const observer = {
    longitude: degreesToRadians(longitude),
    latitude: degreesToRadians(latitude),
    height: heightKm,
  };
  const stepMs = 10_000;
  const searchStart = new Date(start.getTime() - 20 * 60_000);
  const passes: PassPrediction[] = [];
  let previous: Look | null = null;
  let previousTime = searchStart;
  let open: { aos: Date; aosAzimuth: number; maxElevation: number; maxAzimuth: number; tca: Date; doppler: number } | null = null;

  for (let time = searchStart.getTime(); time <= end.getTime(); time += stepMs) {
    const date = new Date(time);
    const look = sample(satrec, date, observer);
    if (!look) {
      previous = null;
      previousTime = date;
      continue;
    }
    const above = look.elevation >= minElevation;
    const wasAbove = previous !== null && previous.elevation >= minElevation;
    if (above && !wasAbove) {
      const aos = previous ? refineCrossing(satrec, observer, previousTime, date, minElevation, true) : date;
      const aosLook = sample(satrec, aos, observer) ?? look;
      open = {
        aos,
        aosAzimuth: aosLook.azimuth,
        maxElevation: look.elevation,
        maxAzimuth: look.azimuth,
        tca: date,
        doppler: look.doppler,
      };
    } else if (above && open && look.elevation > open.maxElevation) {
      open.maxElevation = look.elevation;
      open.maxAzimuth = look.azimuth;
      open.tca = date;
      open.doppler = look.doppler;
    } else if (!above && wasAbove && open && previous) {
      const los = refineCrossing(satrec, observer, previousTime, date, minElevation, false);
      const losLook = sample(satrec, los, observer) ?? previous;
      if (open.aos.getTime() < end.getTime() && los.getTime() > start.getTime()) {
        const epoch = new Date(satellite.omm.EPOCH).getTime();
        const risingAt = new Date(Math.max(open.aos.getTime(), open.tca.getTime() - 60_000));
        const rising = sample(satrec, risingAt, observer);
        passes.push({
          satelliteId: satellite.id,
          aos: open.aos.toISOString(),
          los: los.toISOString(),
          tca: open.tca.toISOString(),
          maxElevation: open.maxElevation,
          aosAzimuth: open.aosAzimuth,
          losAzimuth: losLook.azimuth,
          maxAzimuth: open.maxAzimuth,
          durationSec: Math.max(0, (los.getTime() - open.aos.getTime()) / 1000),
          dopplerFactor: rising?.doppler ?? open.doppler,
          orbitEpoch: satellite.omm.EPOCH,
          orbitAgeDays: (start.getTime() - epoch) / 86_400_000,
        });
      }
      open = null;
    }
    previous = look;
    previousTime = date;
  }

  return passes;
}
