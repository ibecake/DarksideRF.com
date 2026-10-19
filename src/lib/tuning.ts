import type { Transmitter } from "../types";

export interface Tuning {
  modulation: string | null;
  bandwidthHz: number | null;
  stepHz: number | null;
  fromPassband: boolean;
}

const NICE_HZ = [500, 1000, 2400, 2700, 3000, 6000, 8000, 12_500, 15_000, 20_000, 25_000, 40_000, 50_000, 100_000, 125_000, 150_000, 250_000, 500_000, 1_000_000, 2_000_000, 3_000_000];

function nice(hz: number): number {
  return NICE_HZ.find((step) => step >= hz) ?? Math.round(hz);
}

function family(mode: string): string {
  const name = mode.toUpperCase();
  if (name.startsWith("FMN")) return "FMN";
  if (name === "FM" || name.startsWith("FM ")) return "FM";
  if (name.includes("SSTV") || name.includes("SSDV")) return "SSTV";
  if (name === "LSB") return "LSB";
  if (name === "USB" || name.includes("USB")) return "USB";
  if (name === "CW") return "CW";
  if (name.startsWith("AFSK")) return "AFSK";
  if (name.includes("LRPT")) return "LRPT";
  if (name.includes("HRPT")) return "HRPT";
  if (name === "DSB" || name === "APT") return "DSB";
  if (name.startsWith("BPSK") || name.startsWith("DBPSK") || name.startsWith("PSK")) return "BPSK";
  if (name.includes("QPSK") || name.includes("OQPSK")) return "QPSK";
  if (name.startsWith("GMSK") || name.startsWith("GFSK") || name.startsWith("FSK") || name.startsWith("MSK") || name.startsWith("4FSK") || name.startsWith("FFSK")) return "FSK";
  if (name.startsWith("LORA")) return "LORA";
  if (name.startsWith("DVB") || name === "DATV") return "DATV";
  if (name === "AM") return "AM";
  if (name === "FT8" || name === "WSJT" || name === "PSK31" || name === "QPSK31") return "USB";
  return "OTHER";
}

function digitalWidth(baud: number | null, fallback: number): number {
  if (!baud || baud <= 0) return fallback;
  return nice(Math.max(fallback, baud * 1.5));
}

export function suggestedTuning(transmitter: Transmitter): Tuning {
  const span = transmitter.downlinkHighHz && transmitter.downlinkHighHz > transmitter.downlinkHz + 500
    ? transmitter.downlinkHighHz - transmitter.downlinkHz
    : null;
  const kind = family(transmitter.mode ?? "");
  const preset = presetFor(kind, transmitter.baud);
  if (!preset) return { modulation: null, bandwidthHz: span, stepHz: span ? stepFor(span) : null, fromPassband: span !== null };
  if (!span) return { ...preset, fromPassband: false };
  return { modulation: preset.modulation, bandwidthHz: span, stepHz: stepFor(span), fromPassband: true };
}

function stepFor(bandwidthHz: number): number {
  if (bandwidthHz <= 3000) return 10;
  if (bandwidthHz <= 20_000) return 1000;
  if (bandwidthHz >= 1_000_000) return 10_000;
  return 5000;
}

function presetFor(kind: string, baud: number | null): Omit<Tuning, "fromPassband"> | null {
  switch (kind) {
    case "FM":
    case "SSTV":
      return { modulation: "NFM", bandwidthHz: 15_000, stepHz: 5000 };
    case "FMN":
      return { modulation: "NFM", bandwidthHz: 12_500, stepHz: 2500 };
    case "AFSK":
      return { modulation: "NFM", bandwidthHz: baud && baud >= 9600 ? 25_000 : 15_000, stepHz: 5000 };
    case "USB":
      return { modulation: "USB", bandwidthHz: 2700, stepHz: 10 };
    case "LSB":
      return { modulation: "LSB", bandwidthHz: 2700, stepHz: 10 };
    case "CW":
      return { modulation: "CW", bandwidthHz: 500, stepHz: 10 };
    case "AM":
      return { modulation: "AM", bandwidthHz: 6000, stepHz: 1000 };
    case "DSB":
      return { modulation: "WFM", bandwidthHz: 40_000, stepHz: 1000 };
    case "LRPT":
      return { modulation: "WFM", bandwidthHz: 150_000, stepHz: 1000 };
    case "HRPT":
      return { modulation: "RAW", bandwidthHz: 3_000_000, stepHz: 10_000 };
    case "DATV":
      return { modulation: "RAW", bandwidthHz: 2_000_000, stepHz: 10_000 };
    case "LORA":
      return { modulation: "RAW", bandwidthHz: 125_000, stepHz: 1000 };
    case "BPSK": {
      const width = digitalWidth(baud, 3000);
      return { modulation: width <= 3000 ? "USB" : "RAW", bandwidthHz: width, stepHz: width <= 3000 ? 10 : 100 };
    }
    case "QPSK":
      return { modulation: "RAW", bandwidthHz: digitalWidth(baud, 50_000), stepHz: 1000 };
    case "FSK":
      return { modulation: "RAW", bandwidthHz: digitalWidth(baud, 20_000), stepHz: 100 };
    default:
      return null;
  }
}
