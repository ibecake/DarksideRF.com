import raw from "./activity.json";

export interface HeardReport {
  satelliteId: string;
  report: string;
  latest: string;
  count: number;
  amsatName: string;
}

export interface Je9pelRecord {
  norad: number;
  name: string;
  mhz: number;
  mode: string;
  satelliteId?: string;
  je9pelName?: string;
}

export interface ActivitySnapshot {
  retrievedAt: string;
  je9pelUrl: string;
  amsatUrl: string;
  r4uabFrequencyUrl: string;
  r4uabFrequencyDated: string;
  r4uabRows: number;
  r4uabOutside: number;
  heard: HeardReport[];
  je9pelActiveMissing: Je9pelRecord[];
  je9pelExtraOnTracked: Je9pelRecord[];
}

export const activity = raw as ActivitySnapshot;

const heardBySatellite = new Map(activity.heard.map((report) => [report.satelliteId, report]));

export function heardReport(satelliteId: string): HeardReport | undefined {
  return heardBySatellite.get(satelliteId);
}

export function publishedMhz(mhz: number): string {
  const rounded = Number.isInteger(mhz) ? String(mhz) : String(mhz);
  return `${rounded} MHz`;
}

export function reportDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", timeZone: "UTC" });
}
