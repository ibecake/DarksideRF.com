export function howToListen(mode: string | null, description: string | null): string[] {
  const lines = [
    "Receive only. This page does not give instructions for transmitting.",
    "A predicted pass means the satellite is above your horizon. It does not mean the transmitter is switched on.",
  ];
  if (mode === "FM" || mode === "FMN" || mode === "SSTV") {
    lines.push("Use narrow FM for voice or SSTV. Let the signal drift with Doppler instead of expecting it to sit still on the dial.");
  }
  if (mode === "SSTV") {
    lines.push("Decode with a Robot 36 or Martin decoder only if that is the mode named on the transmitter. Wait for a full frame before judging the pass.");
  }
  if (mode === "USB" || mode === "CW") {
    lines.push("Listen in SSB. A CW beacon is a tone or a series of dits, not a voice channel.");
  }
  if (mode === "AFSK") {
    lines.push("Packet downlinks are usually FM with 1200 baud AFSK. You can hear the modem tones even before a decoder locks.");
  }
  if (mode === "DSB" || mode === "LRPT") {
    lines.push("Weather imagery needs a wider receiver bandwidth than amateur FM, plus a decoder. Hearing a buzz is not the same as having an image.");
  }
  if (mode === "HRPT") {
    lines.push("HRPT is an L-band digital downlink. A VHF whip and an ordinary SDR setup will not receive it.");
  }
  if (description?.toLowerCase().includes("ctcss")) {
    lines.push("A CTCSS note in the catalogue is about how transmitting stations open a repeater. You do not need it to listen.");
  }
  lines.push("Doppler at the highest point of the pass is an estimate from the orbit, not a measured frequency.");
  return lines;
}
