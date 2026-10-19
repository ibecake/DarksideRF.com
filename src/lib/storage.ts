import type { AlertPrefs, Profile, ReceptionLog, Reminder, Store } from "../types";

const KEY = "darksiderf.v1";

export const defaultProfile: Profile = {
  locationName: "Cork, Ireland",
  latitude: 51.8986,
  longitude: -8.4756,
  heightKm: 0.02,
  timeZone: "Europe/Dublin",
  receiverIds: ["hackrf-one", "sdrplay-rspduo"],
  antennaId: "vhf-uhf-whip",
  minElevation: 10,
};

const defaultAlerts: AlertPrefs = {
  browser: false,
  quietStart: "23:00",
  quietEnd: "07:00",
};

function emptyStore(): Store {
  return {
    profile: defaultProfile,
    watchlist: [],
    logs: [],
    reminders: [],
    alerts: defaultAlerts,
  };
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    return {
      ...emptyStore(),
      ...parsed,
      profile: { ...defaultProfile, ...parsed.profile },
      alerts: { ...defaultAlerts, ...parsed.alerts },
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function newId(): string {
  return crypto.randomUUID();
}

export type { ReceptionLog, Reminder };
