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
