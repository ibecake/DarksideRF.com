import { satelliteById } from "../data/catalogue";
import type { ReceptionLog } from "../types";

export interface Achievement {
  slug: string;
  title: string;
  description: string;
  earned: boolean;
}

export function collectedSatelliteIds(logs: ReceptionLog[]): string[] {
  return [...new Set(logs.map((log) => log.satelliteId))];
}

export function decodedSatelliteIds(logs: ReceptionLog[]): string[] {
  return [...new Set(logs.filter((log) => log.receptionStatus === "decoded").map((log) => log.satelliteId))];
}

export function sstvDecodeCount(logs: ReceptionLog[]): number {
  return logs.filter((log) => {
    if (log.receptionStatus !== "decoded") return false;
    const satellite = satelliteById(log.satelliteId);
    const transmitter = satellite?.transmitters.find((item) => item.id === log.transmitterId);
    return transmitter?.mode === "SSTV" || log.eventId !== null;
  }).length;
}

export function achievementsFor(logs: ReceptionLog[]): Achievement[] {
  const collected = collectedSatelliteIds(logs);
  const decodedTransmitters = new Set(
    logs.filter((log) => log.receptionStatus === "decoded" && log.transmitterId).map((log) => log.transmitterId),
  );
  const zombie = logs.some((log) => satelliteById(log.satelliteId)?.zombie);
  const picture = logs.some((log) => log.receptionStatus === "decoded" && sstvDecodeCount([log]) > 0);
  return [
    { slug: "first-contact", title: "First Contact", description: "Log the first satellite reception.", earned: logs.length > 0 },
    { slug: "signal-hunter", title: "Signal Hunter", description: "Receive five distinct satellites.", earned: collected.length >= 5 },
    { slug: "orbital-explorer", title: "Orbital Explorer", description: "Receive ten distinct satellites.", earned: collected.length >= 10 },
    { slug: "picture-perfect", title: "Picture Perfect", description: "Decode the first satellite image.", earned: picture },
    { slug: "zombie-hunter", title: "Zombie Hunter", description: "Log a reception from a legacy or zombie satellite.", earned: zombie },
    { slug: "decoder", title: "Decoder", description: "Decode signals from five distinct transmitters.", earned: decodedTransmitters.size >= 5 },
  ];
}

export interface CollectionSet {
  slug: string;
  name: string;
  description: string;
  satelliteIds: string[];
}

export const collectionSets: CollectionSet[] = [
  {
    slug: "first-signals",
    name: "First Signals",
    description: "Voice and weather downlinks a modest VHF station can attempt.",
    satelliteIds: ["iss", "so-50", "ao-91", "noaa-18"],
  },
  {
    slug: "amateur",
    name: "Amateur Satellites",
    description: "Amateur beacons, voice and linear transponders in this catalogue.",
    satelliteIds: ["iss", "ao-7", "fo-29", "so-50", "ao-73", "ao-91", "jo-97", "rs-44", "ao-27"],
  },
  {
    slug: "iss",
    name: "ISS Explorer",
    description: "Receptions of the ARISS station.",
    satelliteIds: ["iss"],
  },
  {
    slug: "weather",
    name: "Weather Watchers",
    description: "Weather-satellite downlinks with a cited record in this snapshot.",
    satelliteIds: ["noaa-15", "noaa-18", "noaa-19", "meteor-m2"],
  },
  {
    slug: "zombies",
    name: "Zombie Hunters",
    description: "Historic satellites with a reported legacy transmission.",
    satelliteIds: ["ao-7", "uo-11", "les-1"],
  },
  {
    slug: "morse",
    name: "Morse & Beacons",
    description: "Satellites with a cited CW or beacon downlink.",
    satelliteIds: ["ao-7", "fo-29", "ao-73", "jo-97", "rs-44", "sonate-2"],
  },
];
