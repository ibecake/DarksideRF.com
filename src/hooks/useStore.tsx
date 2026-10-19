import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadStore, newId, saveStore } from "../lib/storage";
import type { Profile, ReceptionLog, Reminder, Store } from "../types";

interface StoreApi {
  store: Store;
  updateProfile: (profile: Profile) => void;
  toggleWatch: (satelliteId: string) => void;
  addLog: (draft: Omit<ReceptionLog, "id" | "createdAt" | "updatedAt" | "verificationState">) => void;
  updateLog: (id: string, patch: Partial<ReceptionLog>) => void;
  deleteLog: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  deleteReminder: (id: string) => void;
  setBrowserAlerts: (browser: boolean) => void;
  setQuietHours: (quietStart: string, quietEnd: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const api = useMemo<StoreApi>(() => ({
    store,
    updateProfile: (profile) => setStore((current) => ({ ...current, profile })),
    toggleWatch: (satelliteId) => setStore((current) => ({
      ...current,
      watchlist: current.watchlist.includes(satelliteId)
        ? current.watchlist.filter((id) => id !== satelliteId)
        : [...current.watchlist, satelliteId],
    })),
    addLog: (draft) => {
      const now = new Date().toISOString();
      const log: ReceptionLog = { ...draft, id: newId(), verificationState: "self_reported", createdAt: now, updatedAt: now };
      setStore((current) => ({ ...current, logs: [log, ...current.logs] }));
    },
    updateLog: (id, patch) => setStore((current) => ({
      ...current,
      logs: current.logs.map((log) => (log.id === id ? { ...log, ...patch, updatedAt: new Date().toISOString() } : log)),
    })),
    deleteLog: (id) => setStore((current) => ({ ...current, logs: current.logs.filter((log) => log.id !== id) })),
    addReminder: (reminder) => setStore((current) => ({ ...current, reminders: [...current.reminders, { ...reminder, id: newId() }] })),
    deleteReminder: (id) => setStore((current) => ({ ...current, reminders: current.reminders.filter((reminder) => reminder.id !== id) })),
    setBrowserAlerts: (browser) => setStore((current) => ({ ...current, alerts: { ...current.alerts, browser } })),
    setQuietHours: (quietStart, quietEnd) => setStore((current) => ({ ...current, alerts: { ...current.alerts, quietStart, quietEnd } })),
  }), [store]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useLogbook(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store missing");
  return value;
}
