export interface MonitorSource {
  id: string;
  name: string;
  url: string;
  category: "official" | "specialist";
  language: string;
  pollIntervalHours: number;
  notes: string;
}

export const sources: MonitorSource[] = [
  {
    id: "ariss-sstv",
    name: "ARISS upcoming SSTV",
    url: "https://www.ariss.org/upcoming-sstv-events.html",
    category: "official",
    language: "en",
    pollIntervalHours: 12,
    notes: "Date windows for ISS SSTV. Exact on-air times are often published later.",
  },
  {
    id: "amsat-status",
    name: "AMSAT status summary",
    url: "https://www.amsat.org/status/api/v1/summary.php?hours=720",
    category: "specialist",
    language: "en",
    pollIntervalHours: 24,
    notes: "Heard, telemetry-only, and not-heard reports. A report is not a pass.",
  },
  {
    id: "amsat-uk",
    name: "AMSAT-UK",
    url: "https://amsat-uk.org/",
    category: "specialist",
    language: "en",
    pollIntervalHours: 24,
    notes: "News and activation notes from AMSAT-UK.",
  },
];
