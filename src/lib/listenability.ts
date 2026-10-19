import { antennaById, covers, receiverById } from "../data/equipment";
import type { PassPrediction, ReceiverModel, Suitability, Transmitter } from "../types";

export interface GearMatch {
  receiver: ReceiverModel | null;
  antennaCovers: boolean;
  antennaMarginal: boolean;
  suitability: Suitability;
  score: number;
  reasons: string[];
}

function modePracticality(mode: string | null): number {
  switch (mode) {
    case "FM":
    case "FMN":
    case "SSTV":
    case "USB":
    case "CW":
    case "DSB":
    case "AFSK":
      return 0.9;
    case "LRPT":
    case "BPSK":
    case "FSK":
    case "GMSK":
    case "GMSK USP":
    case "DUV":
      return 0.45;
    case "HRPT":
      return 0.25;
    default:
      return 0.4;
  }
}

function categoryFor(score: number, gearFail: boolean, orbitAgeDays: number): Suitability {
  if (gearFail) return "Extra Equipment Required";
  if (orbitAgeDays > 14) return "Experimental";
  if (score >= 0.75) return "Good Candidate";
  if (score >= 0.55) return "Worth Trying";
  return "Experimental";
}

export function assess(
  transmitter: Transmitter,
  pass: PassPrediction,
  receiverIds: string[],
  antennaId: string,
): GearMatch {
  const antenna = antennaById(antennaId);
  const antennaCovers = antenna ? covers(antenna.bands, transmitter.downlinkHz) : false;
  const antennaMarginal = antenna ? covers(antenna.marginalBands, transmitter.downlinkHz) : false;
  const capable = receiverIds
    .map((id) => receiverById(id))
    .filter((receiver): receiver is ReceiverModel => Boolean(receiver))
    .filter((receiver) => covers(receiver.bands, transmitter.downlinkHz))
    .sort((a, b) => b.listeningRank - a.listeningRank);
  const receiver = capable[0] ?? null;
  const gearScore = !receiver || (!antennaCovers && !antennaMarginal) ? 0 : antennaCovers ? 1 : 0.55;
  const updatedAgeDays = (Date.now() - new Date(transmitter.updated).getTime()) / 86_400_000;
  const activity = transmitter.alive && transmitter.citation.startsWith("http") ? (updatedAgeDays > 800 ? 0.65 : 1) : 0.35;
  const geometry = Math.max(0, Math.min(1, (pass.maxElevation - 10) / 50));
  const orbit = pass.orbitAgeDays <= 3 ? 1 : pass.orbitAgeDays <= 10 ? 0.6 : 0.2;
  const practical = modePracticality(transmitter.mode);
  const score = activity * 0.3 + gearScore * 0.25 + geometry * 0.2 + practical * 0.15 + orbit * 0.1;
  const reasons = [
    transmitter.alive ? "SatNOGS lists this downlink as active." : "SatNOGS does not currently mark this downlink alive.",
    receiver ? `${receiver.name} covers this frequency.` : "None of the selected receivers cover this frequency.",
    antennaCovers ? "The selected antenna is in a plausible band." : antennaMarginal ? "The antenna is only marginal here." : "The selected antenna is outside its useful bands.",
  ];
  if (pass.orbitAgeDays > 10) reasons.push("Orbital elements are getting old, so the pass time is less trustworthy.");
  return {
    receiver,
    antennaCovers,
    antennaMarginal,
    suitability: categoryFor(score, gearScore === 0, pass.orbitAgeDays),
    score,
    reasons,
  };
}

export function bestTransmitter<T extends { transmitter: Transmitter; assessment: GearMatch }>(options: T[]): T | null {
  if (options.length === 0) return null;
  return [...options].sort((a, b) => b.assessment.score - a.assessment.score)[0];
}
