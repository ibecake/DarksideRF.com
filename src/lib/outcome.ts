import type { Transmitter } from "../types";

export interface Outcome {
  label: string;
  detail: string;
}

function haystack(transmitter: Transmitter): string {
  return `${transmitter.mode ?? ""} ${transmitter.description ?? ""}`.toLowerCase();
}

function isDigital(mode: string): boolean {
  return /^(BPSK|DBPSK|PSK\b|QPSK|OQPSK|DQPSK|SQPSK|DPSK|FSK|GMSK|GFSK|MSK|4FSK|FFSK|OFDM|DOKA|CERTO|DUV|GENESIS)/.test(mode);
}

export function expectedOutcome(transmitter: Transmitter): Outcome {
  const text = haystack(transmitter);
  const mode = (transmitter.mode ?? "").toUpperCase();

  if (mode.includes("SSDV") || text.includes("ssdv")) {
    return { label: "SSDV image", detail: "Picture packets to assemble into an image." };
  }
  if (mode.includes("SSTV") || text.includes("sstv")) {
    const named = /robot[\s-]*36/.test(text) ? "Robot 36" : /martin/.test(text) ? "Martin" : null;
    return {
      label: "SSTV image",
      detail: named ? `A ${named} still picture when a full frame fits in the pass.` : "A still picture when a full frame fits in the pass.",
    };
  }
  if (mode.includes("LRPT") || text.includes("lrpt")) {
    return { label: "Weather picture", detail: "A digital LRPT weather picture from the recording." };
  }
  if (mode.includes("HRPT") || text.includes("ahrpt") || text.includes("hrpt") || text.includes("hrit")) {
    return { label: "Weather picture", detail: "A high-resolution weather picture from a wide recording." };
  }
  if (mode === "DSB" || mode === "APT" || text.includes("direct sounder") || /\bapt\b/.test(text)) {
    return { label: "Weather picture", detail: "An APT weather picture decoded from the wide signal." };
  }
  if (mode.startsWith("DVB") || mode === "DATV" || text.includes("dvb")) {
    return { label: "Digital video", detail: "A moving picture from a DVB-S2 receiver tuned to this downlink." };
  }
  if (mode === "WSJT" || mode === "FT8") {
    return { label: "WSJT decode", detail: "A decoded WSJT message from this pass." };
  }
  if (mode === "QPSK31" || mode.includes("PSK31")) {
    return { label: "Digital decode", detail: "A decoded narrowband message from this pass." };
  }
  if (mode.startsWith("AFSK") || text.includes("afsk") || text.includes("ax.25") || text.includes("aprs") || text.includes("packet")) {
    return { label: "Packet decode", detail: "Modem tones, then frames when a packet decoder locks." };
  }
  if (mode.startsWith("LORA") || text.includes("lora")) {
    return { label: "LoRa packet", detail: "A packet when the LoRa spreading and bandwidth match this record." };
  }
  if (mode === "CW" || mode.includes("OOK")) {
    return { label: "Morse beacon", detail: "A tone or Morse you can copy by ear." };
  }
  if (mode === "USB" || mode === "LSB" || mode === "AM") {
    if (text.includes("transponder") || text.includes("linear")) {
      return { label: "SSB passband", detail: "Voice or Morse somewhere in the transponder passband." };
    }
    if (text.includes("carrier")) {
      return { label: "Waterfall check", detail: "A carrier on the waterfall at this frequency." };
    }
    return { label: "SSB signal", detail: "Voice or a tone on single sideband." };
  }
  if (mode === "FM" || mode.startsWith("FM ") || mode === "FMN" || mode.startsWith("FMN")) {
    if (/voice|repeater|crew|digitalker|ctcss/.test(text) || /mode\s+[vuhs]\/[vuhs]\s+fm/.test(text)) {
      return { label: "Voice", detail: "Speech on narrow FM while this transmitter is on." };
    }
    return { label: "Waterfall check", detail: "A carrier or telemetry tones on the waterfall." };
  }
  if (isDigital(mode)) {
    return { label: "Waterfall check", detail: "A carrier or a burst on the waterfall. A matching decoder can turn the same recording into frames." };
  }
  if (!transmitter.mode || mode === "UNKNOWN") {
    return { label: "Waterfall check", detail: "Energy at this frequency on the waterfall." };
  }
  return { label: "Waterfall check", detail: "A carrier or a burst on the waterfall." };
}
