import type { Satellite, Transmitter } from "../types";
import { liveEventFor } from "../data/events";
import { stationStatus } from "../data/operations";
import { bestTransmitter, type GearMatch } from "./listenability";
import { expectedOutcome } from "./outcome";

export function eventOnlyTransmitter(transmitter: Transmitter): boolean {
  const text = `${transmitter.mode ?? ""} ${transmitter.description ?? ""}`.toLowerCase();
  return text.includes("sstv") || text.includes("ssdv") || /\bimaging\b/.test(text);
}

export function signalName(transmitter: Transmitter): string {
  const text = `${transmitter.mode ?? ""} ${transmitter.description ?? ""}`.toLowerCase();
  const outcome = expectedOutcome(transmitter);
  if (outcome.label === "Voice" && text.includes("repeater")) return "Voice repeater";
  if (outcome.label === "Voice" && text.includes("crew")) return "Crew voice";
  if (outcome.label === "Voice") return "Voice";
  if (outcome.label === "Packet decode") return "Packet";
  if (outcome.label === "SSTV image") return "SSTV image";
  return outcome.label;
}

export function headlineTransmitter(
  satellite: Satellite,
  ranked: { transmitter: Transmitter; assessment: GearMatch }[],
  at: Date,
): Transmitter | null {
  const pool = ranked.length > 0 ? ranked.map((item) => item.transmitter) : satellite.transmitters;
  const live = liveEventFor(satellite.id, at);
  if (live) {
    const match = pool.find((transmitter) => Math.abs(transmitter.downlinkHz - live.frequencyHz) <= 5_000);
    if (match) return match;
  }
  const preferredHz = stationStatus(satellite.id, at)?.preferDownlinkHz;
  if (preferredHz) {
    const preferred = pool.find((transmitter) => transmitter.downlinkHz === preferredHz && !eventOnlyTransmitter(transmitter));
    if (preferred) return preferred;
  }
  const routine = ranked.filter((item) => !eventOnlyTransmitter(item.transmitter));
  if (routine.length > 0) return bestTransmitter(routine)?.transmitter ?? null;
  return pool.find((transmitter) => !eventOnlyTransmitter(transmitter)) ?? pool[0] ?? null;
}

export function orderedSignals(satellite: Satellite, preferredId: string | null): Transmitter[] {
  return [...satellite.transmitters].sort((a, b) => {
    if (a.id === preferredId) return -1;
    if (b.id === preferredId) return 1;
    return Number(eventOnlyTransmitter(a)) - Number(eventOnlyTransmitter(b)) || a.downlinkHz - b.downlinkHz;
  });
}
