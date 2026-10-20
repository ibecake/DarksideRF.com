import { satellites } from "./catalogue";
import type { Satellite } from "../types";

export interface HuntSource {
  name: string;
  url: string;
}

export function huntRole(satellite: Satellite): string | null {
  if (satellite.id === "les-1") return "Positive control";
  if (satellite.id === "ao-7") return "Known revival";
  if (satellite.status === "historical" || satellite.zombie) return "Legacy beacon";
  if (satellite.status === "degraded") return "Degraded";
  if (satellite.status === "intermittent") return "Intermittent";
  return null;
}

export function huntCandidates(): Satellite[] {
  return satellites.filter((satellite) => huntRole(satellite)).sort((a, b) => a.name.localeCompare(b.name));
}

export function huntSources(satellite: Satellite): HuntSource[] {
  const fromTransmitters = satellite.transmitters
    .filter((transmitter) => transmitter.citation.startsWith("http"))
    .map((transmitter) => ({ name: transmitter.description || transmitter.mode || "Downlink record", url: transmitter.citation }));
  if (satellite.id === "les-1") {
    return [
      { name: "MIT Lincoln Laboratory, LES-1", url: "https://www.ll.mit.edu/about/history/les/les-1" },
      { name: "MIT Lincoln Laboratory, the 2012 signal", url: "https://www.ll.mit.edu/news/satellite-signals-after-45-years-radio-silence" },
      ...fromTransmitters,
    ];
  }
  return fromTransmitters;
}

export function huntBrief(satellite: Satellite): string {
  if (satellite.id === "les-1") {
    return "MIT Lincoln Laboratory says amateurs detected a 237 MHz telemetry signal in 2012, 45 years after the transmitter shut down in 1967. Their account is that it transmits when the solar panels are in sunlight and can be silent while the Earth eclipses it. This catalogue stores a 236.997 MHz USB carrier. Pass times use the current tracked elements, not a 1965 element set.";
  }
  return satellite.summary;
}
