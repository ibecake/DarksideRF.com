import { heardReport, reportDate } from "../data/activity";
import type { Satellite } from "../types";

export interface SourceValidity {
  label: "Heard recently" | "Documented" | "Ageing record" | "Uncertain" | "Unlikely";
  tone: "received" | "decoded" | "caution" | "missing";
  detail: string;
}

const FRESH_DAYS = 800;

export function sourceValidity(satellite: Satellite, now = Date.now()): SourceValidity {
  const heard = heardReport(satellite.id);
  if (satellite.id === "les-1" || satellite.status === "intermittent" || satellite.status === "degraded") {
    const hearing = heard ? ` AMSAT listeners reported ${heard.report} on ${reportDate(heard.latest)}.` : "";
    const why = satellite.id === "les-1"
      ? "It has been heard long after shutdown, and the published account says it transmits in sunlight and can be silent in eclipse."
      : `The catalogue marks this mission ${satellite.status}.`;
    return {
      label: "Uncertain",
      tone: "caution",
      detail: `${why}${hearing} A pass is a look, not a promise of a signal.`,
    };
  }
  if (satellite.zombie || satellite.status === "zombie" || satellite.status === "historical") {
    return {
      label: "Unlikely",
      tone: "missing",
      detail: "Legacy spacecraft. A current orbit says where it is. It does not mean a transmitter is on.",
    };
  }
  if (heard) {
    return {
      label: "Heard recently",
      tone: "received",
      detail: `AMSAT listeners reported ${heard.report} on ${reportDate(heard.latest)}. That is a hearing, not a schedule.`,
    };
  }
  const newest = satellite.transmitters.reduce((max, transmitter) => Math.max(max, Date.parse(transmitter.updated) || 0), 0);
  const ageDays = newest ? (now - newest) / 86_400_000 : Number.POSITIVE_INFINITY;
  if (ageDays > FRESH_DAYS) {
    return {
      label: "Ageing record",
      tone: "caution",
      detail: "SatNOGS still lists an active downlink, but the stored record is more than two years old and this 30-day AMSAT rollup has no hearing. Treat the frequency as unverified.",
    };
  }
  return {
    label: "Documented",
    tone: "decoded",
    detail: "An active SatNOGS downlink with a citation. This 30-day AMSAT rollup has no hearing. Absence from that rollup is not proof the satellite is silent.",
  };
}

export function orbitAgeDays(epoch: string, now = Date.now()): number {
  return (now - Date.parse(epoch)) / 86_400_000;
}
