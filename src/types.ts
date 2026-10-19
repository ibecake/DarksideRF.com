export type SatelliteCategory =
  | "amateur"
  | "weather"
  | "sstv"
  | "experimental"
  | "historical"
  | "zombie";

export type OperationalStatus =
  | "operational"
  | "intermittent"
  | "degraded"
  | "historical"
  | "zombie"
  | "reported";

export interface Transmitter {
  id: string;
  downlinkHz: number;
  downlinkHighHz: number | null;
  mode: string | null;
  baud: number | null;
  description: string | null;
  service: string | null;
  alive: boolean;
  status: string;
  updated: string;
  citation: string;
}

export interface OrbitMeanElements {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  NORAD_CAT_ID: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
  EPHEMERIS_TYPE: number;
  CLASSIFICATION_TYPE: string;
  ELEMENT_SET_NO: number;
  REV_AT_EPOCH: number;
}

export interface Satellite {
  id: string;
  norad: number;
  name: string;
  cospar: string;
  aliases: string[];
  operator: string;
  category: SatelliteCategory;
  status: OperationalStatus;
  zombie: boolean;
  summary: string;
  omm: OrbitMeanElements;
  transmitters: Transmitter[];
}

export interface CatalogueFile {
  retrievedAt: string;
  orbitSource: string;
  transmitterSource: string;
  satellites: Satellite[];
}

export interface FrequencyBand {
  minHz: number;
  maxHz: number;
}

export interface ReceiverModel {
  id: string;
  name: string;
  family: string;
  bands: FrequencyBand[];
  bits: string;
  notes: string;
  source: string;
  listeningRank: number;
}

export interface AntennaModel {
  id: string;
  name: string;
  bands: FrequencyBand[];
  marginalBands: FrequencyBand[];
  polarisation: string;
  directionality: string;
  notes: string;
}

export type Suitability =
  | "Good Candidate"
  | "Worth Trying"
  | "Experimental"
  | "Extra Equipment Required";

export interface PassPrediction {
  satelliteId: string;
  aos: string;
  los: string;
  tca: string;
  maxElevation: number;
  aosAzimuth: number;
  losAzimuth: number;
  maxAzimuth: number;
  durationSec: number;
  dopplerFactor: number;
  orbitEpoch: string;
  orbitAgeDays: number;
}

export interface Profile {
  locationName: string;
  latitude: number;
  longitude: number;
  heightKm: number;
  timeZone: string;
  receiverIds: string[];
  antennaId: string;
  minElevation: number;
}

export interface ReceptionLog {
  id: string;
  satelliteId: string;
  transmitterId: string | null;
  eventId: string | null;
  receivedAt: string;
  receptionStatus: "received" | "decoded";
  receiverModelId: string | null;
  antennaModelId: string | null;
  frequencyHz: number | null;
  notes: string;
  quality: string;
  sourceType: "live_entry" | "manual_historical";
  verificationState: "self_reported";
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  satelliteId: string;
  label: string;
  passAos: string;
  fireAt: string;
}

export interface AlertPrefs {
  browser: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface Store {
  profile: Profile;
  watchlist: string[];
  logs: ReceptionLog[];
  reminders: Reminder[];
  alerts: AlertPrefs;
}

export type TimeWindow = "now" | "6h" | "tonight" | "7d";

export interface ListeningEvent {
  id: string;
  type: "sstv";
  title: string;
  satelliteId: string;
  frequencyHz: number;
  mode: string;
  startDate: string;
  endDate: string;
  timePrecision: "date";
  status: "announced";
  pattern: string;
  summary: string;
  sources: { name: string; url: string }[];
}
