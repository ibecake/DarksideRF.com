// ARISS station status, as published. This is not a live poll.

const REPEATER_OFF_FROM = Date.parse("2026-11-26T09:35:00Z");
const REPEATER_OFF_UNTIL = Date.parse("2026-11-27T09:40:00Z");

export interface StationStatus {
  short: string;
  detail: string;
  preferDownlinkHz: number | null;
  sourceName: string;
  sourceUrl: string;
}

export function stationStatus(satelliteId: string, at = new Date()): StationStatus | null {
  if (satelliteId !== "iss") return null;
  const off = at.getTime() >= REPEATER_OFF_FROM && at.getTime() < REPEATER_OFF_UNTIL;
  return {
    short: off
      ? "Voice repeater scheduled off until 27 Nov 09:40 UTC. No SSTV series is scheduled."
      : "Voice repeater, 437.800 MHz down. No SSTV series is scheduled.",
    detail: off
      ? "ARISS listed the Columbus radio off from 26 November 2026 09:35 UTC until 27 November 2026 09:40 UTC for vehicle operations. Outside that window the published mode is the voice repeater: 437.800 MHz down, 145.990 MHz up, PL 67. Service Module packet is listed at 437.825 MHz. The last SSTV series ended 16 November 2026 at 08:15 UTC. Status dated 24 November 2026."
      : "ARISS, status as of 24 November 2026: the Columbus radio is in voice repeater mode, 437.800 MHz down and 145.990 MHz up, PL 67. It is scheduled off 26 November 2026 09:35 UTC until 27 November 2026 09:40 UTC. Service Module packet is listed at 437.825 MHz. This catalogue still has an older 145.825 MHz packet record. SSTV runs only during an announced series, and none is scheduled.",
    preferDownlinkHz: 437_800_000,
    sourceName: "ARISS current status of ISS stations",
    sourceUrl: "https://www.ariss.org/current-status-of-iss-stations.html",
  };
}
