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
    notes: "Finished and announced ISS SSTV series. The latest published series included exact UTC times.",
  },
  {
    id: "ariss-station-status",
    name: "ARISS current status of ISS stations",
    url: "https://www.ariss.org/current-status-of-iss-stations.html",
    category: "official",
    language: "en",
    schedule: "Check about every 12 hours",
    notes: "Which ISS radio is in voice repeater, packet, or off. A listed mode is the published configuration, not a measurement from this station.",
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
