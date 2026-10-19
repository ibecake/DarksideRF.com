import { satellites } from "../data/catalogue";
import { predictPasses } from "../lib/passes";
import type { PassPrediction } from "../types";

interface RequestMessage {
  latitude: number;
  longitude: number;
  heightKm: number;
  startMs: number;
  endMs: number;
  minElevation: number;
  satelliteIds?: string[];
}

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { latitude, longitude, heightKm, startMs, endMs, minElevation, satelliteIds } = event.data;
  const chosen = satelliteIds ? satellites.filter((satellite) => satelliteIds.includes(satellite.id)) : satellites;
  const passes: PassPrediction[] = [];
  for (const satellite of chosen) {
    try {
      passes.push(...predictPasses(satellite, new Date(startMs), new Date(endMs), latitude, longitude, heightKm, minElevation));
    } catch {
      // A bad element set should drop that satellite, not the whole search.
    }
  }
  passes.sort((a, b) => a.aos.localeCompare(b.aos));
  self.postMessage(passes);
};
