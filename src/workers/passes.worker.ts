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

export interface PassSearchResult {
  passes: PassPrediction[];
  pending: boolean;
  completed: number;
  total: number;
}

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { latitude, longitude, heightKm, startMs, endMs, minElevation, satelliteIds } = event.data;
  const chosen = satelliteIds ? satellites.filter((satellite) => satelliteIds.includes(satellite.id)) : satellites;
  const span = endMs - startMs;
  const fullCatalogue = !satelliteIds;
  const stepMs = fullCatalogue ? (span > 12 * 3_600_000 ? 45_000 : 15_000) : 10_000;
  const maxPasses = fullCatalogue ? 1 : undefined;
  const passes: PassPrediction[] = [];
  chosen.forEach((satellite, index) => {
    try {
      passes.push(...predictPasses(satellite, new Date(startMs), new Date(endMs), latitude, longitude, heightKm, minElevation, { stepMs, maxPasses }));
    } catch {
      // A bad element set should drop that satellite, not the whole search.
    }
    if (fullCatalogue && (index + 1) % 40 === 0) {
      const update: PassSearchResult = { passes: [], pending: true, completed: index + 1, total: chosen.length };
      self.postMessage(update);
    }
  });
  passes.sort((a, b) => a.aos.localeCompare(b.aos));
  const done: PassSearchResult = { passes, pending: false, completed: chosen.length, total: chosen.length };
  self.postMessage(done);
};
