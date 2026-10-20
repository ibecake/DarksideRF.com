export interface MonitorSource {
  id: string;
  name: string;
  url: string;
  category: "official" | "specialist";
  language: string;
  schedule: string;
  notes: string;
}

export const sources: MonitorSource[] = [
  {
    id: "ariss-sstv",
    name: "ARISS upcoming SSTV",
    url: "https://www.ariss.org/upcoming-sstv-events.html",
    category: "official",
    language: "en",
    schedule: "Check about every 12 hours",
    notes: "Date windows for ISS SSTV. Exact on-air times are often published later.",
  },
  {
    id: "amsat-status",
    name: "AMSAT status summary",
    url: "https://www.amsat.org/status/api/v1/summary.php?hours=720",
    category: "specialist",
    language: "en",
    schedule: "Check about every 24 hours",
    notes: "Heard, telemetry-only, and not-heard reports. A report is not a pass.",
  },
  {
    id: "amsat-uk",
    name: "AMSAT-UK",
    url: "https://amsat-uk.org/",
    category: "specialist",
    language: "en",
    schedule: "Check about every 24 hours",
    notes: "News and activation notes from AMSAT-UK.",
  },
  {
    id: "ucs-satellite-database",
    name: "UCS Satellite Database",
    url: "https://www.ucs.org/media/11493",
    category: "specialist",
    language: "en",
    schedule: "Text file, 1 May 2023 edition",
    notes: "Records mass, power, launch date, expected lifetime, apogee, perigee, inclination, period, purpose, and who owns, operates, and built the satellite. It does not list a downlink.",
  },
];
