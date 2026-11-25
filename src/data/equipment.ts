import { rfDemodForMode } from "../lib/tuning";
import type { AntennaModel, ReceiverModel } from "../types";

const mhz = (value: number) => value * 1e6;
const khz = (value: number) => value * 1e3;

export const receivers: ReceiverModel[] = [
  {
    id: "rtlsdr-blog-v3",
    name: "RTL-SDR Blog V3",
    family: "RTL-SDR",
    bands: [{ minHz: mhz(24), maxHz: mhz(1766) }],
    bits: "8-bit",
    notes: "R820T2 tuner. Direct sampling can be switched on for HF, but that is not a dedicated HF front end.",
    source: "https://www.rtl-sdr.com/rtl-sdr-blog-v-3-dongles-user-guide/",
    listeningRank: 4,
    modes: null,
  },
  {
    id: "rtlsdr-blog-v4",
    name: "RTL-SDR Blog V4",
    family: "RTL-SDR",
    bands: [{ minHz: khz(500), maxHz: mhz(1766) }],
    bits: "8-bit",
    notes: "Built-in upconverter for HF. Still an 8-bit receiver.",
    source: "https://www.rtl-sdr.com/v4/",
    listeningRank: 4,
    modes: null,
  },
  {
    id: "nooelec-smart-v5",
    name: "Nooelec NESDR SMArt v5",
    family: "RTL-SDR",
    bands: [{ minHz: mhz(25), maxHz: mhz(1750) }],
    bits: "8-bit",
    notes: "R820T2-class dongle. Exact edges vary by board; treat the edges as approximate.",
    source: "https://www.nooelec.com/store/sdr/sdr-receivers/nesdr-smart-sdr.html",
    listeningRank: 3,
    modes: null,
  },
  {
    id: "hackrf-one",
    name: "HackRF One",
    family: "HackRF",
    bands: [{ minHz: mhz(1), maxHz: mhz(6000) }],
    bits: "8-bit",
    notes: "Half-duplex. Wide coverage, with a higher noise floor than a dedicated VHF receiver.",
    source: "https://hackrf.readthedocs.io/en/latest/hackrf_one.html",
    listeningRank: 2,
    modes: null,
  },
  {
    id: "sdrplay-rspduo",
    name: "SDRplay RSPduo",
    family: "SDRplay",
    bands: [{ minHz: khz(1), maxHz: mhz(2000) }],
    bits: "14-bit",
    notes: "Dual-tuner receiver. Advertised coverage still depends on the antenna in front of it.",
    source: "https://www.sdrplay.com/rspduo/",
    listeningRank: 6,
    modes: null,
  },
  {
    id: "sdrplay-rsp1a",
    name: "SDRplay RSP1A",
    family: "SDRplay",
    bands: [{ minHz: khz(1), maxHz: mhz(2000) }],
    bits: "14-bit",
    notes: "Single-tuner SDRplay. Same caution: frequency coverage is not the same as a usable signal.",
    source: "https://www.sdrplay.com/rsp1a/",
    listeningRank: 6,
    modes: null,
  },
  {
    id: "airspy-mini",
    name: "Airspy Mini",
    family: "Airspy",
    bands: [{ minHz: mhz(24), maxHz: mhz(1800) }],
    bits: "12-bit",
    notes: "No HF coverage without an external converter.",
    source: "https://airspy.com/airspy-mini/",
    listeningRank: 5,
    modes: null,
  },
  {
    id: "airspy-hf-discovery",
    name: "Airspy HF+ Discovery",
    family: "Airspy",
    bands: [
      { minHz: khz(0.5), maxHz: mhz(31) },
      { minHz: mhz(60), maxHz: mhz(260) },
    ],
    bits: "18-bit class",
    notes: "Strong for HF and VHF. There is a gap from 31 to 60 MHz, and no UHF coverage.",
    source: "https://airspy.com/airspy-hf-discovery/",
    listeningRank: 7,
    modes: null,
  },
  {
    id: "funcube-pro-plus",
    name: "FUNcube Dongle Pro+",
    family: "FUNcube",
    bands: [
      { minHz: khz(150), maxHz: mhz(240) },
      { minHz: mhz(420), maxHz: mhz(1900) },
    ],
    bits: "16-bit",
    notes: "Gap between 240 and 420 MHz.",
    source: "http://www.funcubedongle.com/?page_id=1201",
    listeningRank: 5,
    modes: null,
  },
  {
    id: "adalm-pluto",
    name: "ADALM-Pluto",
    family: "Analog Devices",
    bands: [{ minHz: mhz(325), maxHz: mhz(3800) }],
    bits: "12-bit",
    notes: "Stock tuning range. Software extensions exist, but this profile uses the published stock limits. No 2 m coverage.",
    source: "https://www.analog.com/en/resources/evaluation-hardware-and-software/evaluation-boards-kits/adalm-pluto.html",
    listeningRank: 3,
    modes: null,
  },
  {
    id: "limesdr-mini",
    name: "LimeSDR Mini",
    family: "Lime",
    bands: [{ minHz: mhz(10), maxHz: mhz(3500) }],
    bits: "12-bit",
    notes: "Wideband SDR. Performance at the band edges is not uniform.",
    source: "https://limemicro.com/products/boards/limesdr-mini/",
    listeningRank: 3,
    modes: null,
  },
  {
    id: "handheld-fm-baofeng-class",
    name: "Handheld FM transceiver (Baofeng-class)",
    family: "Handheld",
    bands: [
      { minHz: mhz(136), maxHz: mhz(174) },
      { minHz: mhz(400), maxHz: mhz(520) },
    ],
    bits: "FM demod",
    notes:
      "A stand-in for common dual-band HTs such as a Baofeng UV-9R / UV-5R and similar radios. This catalogue does not list every handheld on the market. Strong for ISS and amateur FM voice; awkward for SSTV or digital work unless you take audio out. Coverage below is the usual published VHF/UHF range for that class, not a guarantee every clone opens the same edges.",
    source: "https://manuals.plus/baofeng/uv-9r-plus-portable-two-way-radio-manual",
    listeningRank: 5,
    modes: ["FM", "FMN"],
  },
];

export const antennas: AntennaModel[] = [
  {
    id: "vhf-uhf-whip",
    name: "Generic VHF/UHF whip",
    bands: [
      { minHz: mhz(136), maxHz: mhz(152) },
      { minHz: mhz(420), maxHz: mhz(450) },
    ],
    marginalBands: [{ minHz: mhz(220), maxHz: mhz(250) }],
    polarisation: "Vertical",
    directionality: "Roughly omnidirectional",
    notes: "A test whip for 2 m and 70 cm. Weather-satellite frequencies near 137 MHz sit at the low edge. It is a poor match for HF, 237 MHz, and L-band.",
    buildSummary: "A whip is a bought antenna. For a first home-built satellite antenna, make the V-dipole instead.",
    buildSteps: [
      "Screw the whip onto the receiver, or onto a magnetic mount if you are using one outdoors.",
      "Hold it upright. A whip lying on the desk hears much less.",
      "It is the simplest thing to try, and a poor match below 136 MHz or above 450 MHz.",
    ],
  },
  {
    id: "v-dipole",
    name: "V-dipole",
    bands: [
      { minHz: mhz(108), maxHz: mhz(150) },
      { minHz: mhz(400), maxHz: mhz(460) },
    ],
    marginalBands: [{ minHz: mhz(200), maxHz: mhz(260) }],
    polarisation: "Depends how you aim the V",
    directionality: "Broad, toward the open side of the V",
    notes: "Two wires and a coax joint. The simplest antenna that is actually meant for satellite listening.",
    buildSummary: "Two equal wires, spread about 120° apart, fed with coax at the joint. Cut each wire for the band you want to hear.",
    buildSteps: [
      "Each leg is a quarter of a wavelength. Length in centimetres is about 7130 divided by the frequency in MHz. For 137.5 MHz that is about 52 cm. For 145 MHz, about 49 cm. For 436 MHz, about 16 cm.",
      "Spread the two wires so the angle between them is roughly 120°. A scrap of plastic, a terminal block, or tape on a stick is enough to hold the angle.",
      "Connect one wire to the centre of the coax and the other to the braid. Keep those two joints from touching.",
      "Aim the open side of the V toward the sky, broadside to where the satellite will pass. You do not need to track it by hand.",
      "Start here before building a Yagi. A V-dipole hears weather satellites near 137 MHz and amateur downlinks on 2 m and 70 cm.",
    ],
  },
  {
    id: "random-wire",
    name: "Random wire",
    bands: [{ minHz: mhz(3), maxHz: mhz(30) }],
    marginalBands: [{ minHz: mhz(1), maxHz: mhz(88) }],
    polarisation: "Mostly horizontal",
    directionality: "Uneven",
    notes: "The simplest HF antenna: one wire, as long and as high as you can manage.",
    buildSummary: "One long wire for HF. This is the simplest way to hear something like the AO-7 beacon near 29 MHz.",
    buildSteps: [
      "Use whatever insulated wire you have. Five to ten metres is enough to begin. Longer and higher hears more.",
      "Get one end up, a window frame, a tree, or a fishing pole. Keep it off the ground and away from mains cables.",
      "Connect the wire to the centre of the coax. Connect the braid to a second wire laid on the floor, or to a metal window frame, as a counterpoise.",
      "A random wire is the wrong tool for 137 MHz weather satellites and for 70 cm. Use a V-dipole there.",
    ],
  },
  {
    id: "yagi",
    name: "Yagi",
    bands: [
      { minHz: mhz(136), maxHz: mhz(148) },
      { minHz: mhz(430), maxHz: mhz(440) },
    ],
    marginalBands: [],
    polarisation: "Match the elements to the pass",
    directionality: "A narrow beam off the front",
    notes: "More gain than a V-dipole, and you have to point it. Build this after the V-dipole, not instead of it.",
    buildSummary: "A driven element, a slightly longer reflector behind it, and one shorter director in front. Point the short end at the satellite.",
    buildSteps: [
      "Cut the driven element to about half a wavelength: 14700 divided by the frequency in MHz gives centimetres. For 145 MHz that is about 101 cm. For 436 MHz, about 34 cm.",
      "The reflector, behind the driven element, is about 5% longer. The director, in front, is about 5% shorter.",
      "Space them about a fifth of a wavelength apart on a wooden or plastic boom. Metal boom mounting changes the lengths, so keep the first one simple.",
      "Feed the driven element the same way as the V-dipole: coax centre to one half, braid to the other.",
      "Point the director at the satellite and follow the pass. A Yagi aimed the wrong way hears less than a V-dipole.",
    ],
  },
  {
    id: "handheld-yagi",
    name: "Handheld Yagi",
    bands: [
      { minHz: mhz(144), maxHz: mhz(148) },
      { minHz: mhz(430), maxHz: mhz(440) },
    ],
    marginalBands: [{ minHz: mhz(136), maxHz: mhz(144) }],
    polarisation: "Match the elements to the pass",
    directionality: "A hand-held beam off the front",
    notes:
      "The classic portable satellite antenna: an Arrow-style or similar dual-band Yagi you walk with. Pair it with a Baofeng-class handheld for the ISS FM repeater. Weaker than a fixed long boom, and useless if you point it at the ground.",
    buildSummary:
      "A short dual-band Yagi you hold and aim. Buy one, or build a short 2 m / 70 cm boom you can carry with a handheld.",
    buildSteps: [
      "Use a commercial handheld satellite Yagi (Arrow-style and similar), or a short home-built boom with 2 m and 70 cm elements.",
      "Fit an SMA or BNC jumper that matches your handheld. Keep the coax short.",
      "For the ISS FM repeater, tune the handheld to the published downlink (currently 437.800 MHz down) and follow the pass with the short end of the boom.",
      "Hold the boom so the elements match the pass polarisation, and keep swinging with the satellite. A handheld Yagi aimed wrong hears less than the rubber duck.",
      "Weather-satellite APT near 137 MHz sits below the usual 2 m cut. Use a V-dipole there instead.",
    ],
  },
  {
    id: "discovery-dish-lband",
    name: "Discovery Dish (L-band weather feed)",
    bands: [{ minHz: mhz(1645), maxHz: mhz(1715) }],
    marginalBands: [{ minHz: mhz(1620), maxHz: mhz(1645) }],
    polarisation: "Linear; rotate the feed for skew",
    directionality: "Parabolic dish, pointed at the satellite",
    notes:
      "KrakenRF Discovery Dish with the L-band weather feed: SAW filters centred near 1680 MHz (~69 MHz wide). Meant for GOES HRIT, GK-2A / FengYun LRIT, and polar HRPT around 1.69 GHz. Needs a bias-tee capable SDR and aiming.",
    buildSummary: "A 70 cm petal dish with a swappable active feed. Use the L-band weather feed for 1.69 GHz weather downlinks.",
    buildSteps: [
      "Assemble the three dish petals and mount the feed arm so the feed sits at the focus.",
      "Fit the L-band weather feed (SAW passband around 1680 MHz). The feed wants 5 V bias-tee power from the SDR or an injector.",
      "Point the dish at the satellite. GEO weather birds stay fixed; polar HRPT needs a rotator or hand tracking.",
      "Decode with SatDump or similar. A whip or V-dipole will not replace this dish on L-band.",
    ],
  },
  {
    id: "discovery-dish-inmarsat",
    name: "Discovery Dish (Inmarsat feed)",
    bands: [{ minHz: mhz(1525), maxHz: mhz(1660) }],
    marginalBands: [],
    polarisation: "Linear feed on circular downlinks (about 3 dB loss)",
    directionality: "Parabolic dish, pointed at the satellite",
    notes:
      "Same Discovery Dish body with the Inmarsat feed (1525–1660 MHz) for STD-C and AERO. Not a weather-satellite L-band feed — swap feeds when you change mission.",
    buildSummary: "Discovery Dish plus the Inmarsat active feed for 1.5 GHz maritime / aero downlinks.",
    buildSteps: [
      "Swap to the Inmarsat feed arm on the Discovery Dish.",
      "Supply bias-tee power and aim at the Inmarsat bird you want.",
      "Decode with tools such as JAERO or Scytale-C for the service you are after.",
    ],
  },
  {
    id: "discovery-dish-hline",
    name: "Discovery Dish (hydrogen-line feed)",
    bands: [{ minHz: mhz(1410), maxHz: mhz(1430) }],
    marginalBands: [{ minHz: mhz(1400), maxHz: mhz(1410) }, { minHz: mhz(1430), maxHz: mhz(1440) }],
    polarisation: "Linear",
    directionality: "Parabolic dish, aimed at the sky region of interest",
    notes:
      "Discovery Dish with the 1.42 GHz hydrogen-line feed for beginner radio astronomy. This is not a weather or amateur downlink antenna.",
    buildSummary: "Discovery Dish plus the 1.42 GHz hydrogen-line feed for galactic hydrogen observations.",
    buildSteps: [
      "Fit the hydrogen-line feed and bias-tee power.",
      "Aim at the sky region you want to integrate. Motion and RFI matter more than for a strong weather bird.",
      "Use radio-astronomy software suited to a narrow 1.42 GHz passband.",
    ],
  },
];

export function receiverById(id: string): ReceiverModel | undefined {
  return receivers.find((receiver) => receiver.id === id);
}

export function antennaById(id: string): AntennaModel | undefined {
  return antennas.find((antenna) => antenna.id === id);
}

export function covers(bands: { minHz: number; maxHz: number }[], hz: number): boolean {
  return bands.some((band) => hz >= band.minHz && hz <= band.maxHz);
}

export function receiverSupportsMode(receiver: ReceiverModel, mode: string | null): boolean {
  if (!receiver.modes) return true;
  const demod = rfDemodForMode(mode);
  if (!demod) return false;
  const allowed = new Set(receiver.modes.map((item) => item.toUpperCase()));
  if (demod === "FM") return allowed.has("FM") || allowed.has("FMN");
  return allowed.has(demod.toUpperCase());
}

export function receiverCovers(receiver: ReceiverModel, hz: number, mode: string | null): boolean {
  return covers(receiver.bands, hz) && receiverSupportsMode(receiver, mode);
}

export function stationAntennas(antennaIds: string[]): AntennaModel[] {
  return antennaIds.map((id) => antennaById(id)).filter((antenna): antenna is AntennaModel => Boolean(antenna));
}

export function bestStationAntenna(antennaIds: string[], hz: number): AntennaModel | null {
  const selected = stationAntennas(antennaIds);
  return selected.find((antenna) => covers(antenna.bands, hz))
    ?? selected.find((antenna) => covers(antenna.marginalBands, hz))
    ?? null;
}

export function stationCovers(receiverIds: string[], antennaIds: string[], hz: number, mode: string | null = null): boolean {
  const receiverOk = receiverIds.some((id) => {
    const receiver = receiverById(id);
    return receiver ? receiverCovers(receiver, hz, mode) : false;
  });
  const antennaOk = stationAntennas(antennaIds).some((antenna) => covers(antenna.bands, hz));
  return receiverOk && antennaOk;
}

export function simplestAntenna(hz: number): AntennaModel {
  if (hz < 30e6) return antennaById("random-wire") ?? antennas[0];
  if (hz >= mhz(1400) && hz <= mhz(1800)) return antennaById("discovery-dish-lband") ?? antennas[0];
  if (hz >= 1e9) return antennaById("discovery-dish-lband") ?? antennas[0];
  return antennaById("v-dipole") ?? antennas[0];
}

export function isDishAntenna(antenna: AntennaModel): boolean {
  return antenna.id.startsWith("discovery-dish");
}
