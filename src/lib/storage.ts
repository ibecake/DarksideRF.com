import type { AlertPrefs, Profile, ReceptionLog, Reminder, Store } from "../types";

const KEY = "darksiderf.v1";

export const defaultProfile: Profile = {
  locationName: "Cork, Ireland",
  latitude: 51.8986,
  longitude: -8.4756,
  heightKm: 0.02,
  timeZone: "Europe/Dublin",
  receiverIds: ["hackrf-one", "sdrplay-rspduo"],
  antennaIds: ["vhf-uhf-whip"],
  minElevation: 10,
};

export function normalizeProfile(raw: Partial<Profile> & { antennaId?: string }): Profile {
  const { antennaId: legacyAntennaId, ...rest } = raw;
  const antennaIds = raw.antennaIds?.length
    ? raw.antennaIds
    : legacyAntennaId
      ? [legacyAntennaId]
      : defaultProfile.antennaIds;
  return {
    ...defaultProfile,
    ...rest,
    receiverIds: raw.receiverIds?.length ? raw.receiverIds : defaultProfile.receiverIds,
    antennaIds,
  };
}

const defaultAlerts: AlertPrefs = {
  browser: false,
  email: false,
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
      profile: normalizeProfile(parsed.profile ?? {}),
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
