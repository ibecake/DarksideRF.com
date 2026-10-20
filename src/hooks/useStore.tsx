import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mergeAccount, pullAccount, pushAccount } from "../lib/accountSync";
import { loadStore, newId, saveStore } from "../lib/storage";
import type { Profile, ReceptionLog, Reminder, Store } from "../types";
import { useAccount } from "./useAccount";

interface StoreApi {
  store: Store;
  syncState: "local" | "checking" | "saved" | "error";
  syncDetail: string;
  updateProfile: (profile: Profile) => void;
  toggleWatch: (satelliteId: string) => void;
  addLog: (draft: Omit<ReceptionLog, "id" | "createdAt" | "updatedAt" | "verificationState">) => void;
  updateLog: (id: string, patch: Partial<ReceptionLog>) => void;
  deleteLog: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  deleteReminder: (id: string) => void;
  setBrowserAlerts: (browser: boolean) => void;
  setEmailAlerts: (email: boolean) => void;
  setQuietHours: (quietStart: string, quietEnd: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { client, userId } = useAccount();
  const [store, setStore] = useState<Store>(() => loadStore());
  const [syncState, setSyncState] = useState<StoreApi["syncState"]>("local");
  const [syncDetail, setSyncDetail] = useState("");
  const [canPush, setCanPush] = useState(false);

  useEffect(() => {
    if (!client || !userId) {
      setCanPush(false);
      setSyncState("local");
      setSyncDetail("");
      return;
    }
    let cancel = false;
    setCanPush(false);
    setSyncState("checking");
    void pullAccount(client, userId).then((remote) => {
      if (cancel) return;
      setStore((local) => mergeAccount(local, remote));
      setCanPush(true);
      setSyncState("saved");
    }).catch((error: unknown) => {
      if (cancel) return;
      setCanPush(false);
      setSyncState("error");
      setSyncDetail(error instanceof Error ? error.message : "The account copy could not be read.");
    });
    return () => {
      cancel = true;
    };
  }, [client, userId]);

  useEffect(() => {
    saveStore(store);
    if (!client || !userId || !canPush) return;
    const handle = window.setTimeout(() => {
      void pushAccount(client, userId, store).then(() => {
        setSyncState("saved");
        setSyncDetail("");
      }).catch((error: unknown) => {
        setSyncState("error");
        setSyncDetail(error instanceof Error ? error.message : "The account copy could not be saved.");
      });
    }, 500);
    return () => window.clearTimeout(handle);
  }, [store, client, userId, canPush]);

  const api = useMemo<StoreApi>(() => ({
    store,
    syncState,
    syncDetail,
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
    setEmailAlerts: (email) => setStore((current) => ({ ...current, alerts: { ...current.alerts, email } })),
    setQuietHours: (quietStart, quietEnd) => setStore((current) => ({ ...current, alerts: { ...current.alerts, quietStart, quietEnd } })),
  }), [store, syncDetail, syncState]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useLogbook(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store missing");
  return value;
}
