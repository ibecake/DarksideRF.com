import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertPrefs, Profile, ReceptionLog, Reminder, Store } from "../types";

interface StationRow {
  user_id: string;
  profile: Profile;
  watchlist: string[];
  alerts: AlertPrefs;
  updated_at: string;
}

interface LogRow {
  id: string;
  satellite_id: string;
  transmitter_id: string | null;
  event_id: string | null;
  received_at: string;
  reception_status: ReceptionLog["receptionStatus"];
  receiver_model_id: string | null;
  antenna_model_id: string | null;
  frequency_hz: number | null;
  notes: string | null;
  quality: string | null;
  source_type: ReceptionLog["sourceType"];
  verification_state: ReceptionLog["verificationState"];
  created_at: string;
  updated_at: string;
}

interface ReminderRow {
  id: string;
  satellite_id: string;
  label: string;
  pass_aos: string;
  fire_at: string;
}

function logFromRow(row: LogRow): ReceptionLog {
  return {
    id: row.id,
    satelliteId: row.satellite_id,
    transmitterId: row.transmitter_id,
    eventId: row.event_id,
    receivedAt: row.received_at,
    receptionStatus: row.reception_status,
    receiverModelId: row.receiver_model_id,
    antennaModelId: row.antenna_model_id,
    frequencyHz: row.frequency_hz,
    notes: row.notes ?? "",
    quality: row.quality ?? "",
    sourceType: row.source_type,
    verificationState: row.verification_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function reminderFromRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    satelliteId: row.satellite_id,
    label: row.label,
    passAos: row.pass_aos,
    fireAt: row.fire_at,
  };
}

export async function pullAccount(client: SupabaseClient, userId: string): Promise<Store | null> {
  const [station, logs, reminders] = await Promise.all([
    client.from("stations").select("user_id, profile, watchlist, alerts, updated_at").eq("user_id", userId).maybeSingle(),
    client.from("reception_logs").select("id, satellite_id, transmitter_id, event_id, received_at, reception_status, receiver_model_id, antenna_model_id, frequency_hz, notes, quality, source_type, verification_state, created_at, updated_at").eq("user_id", userId),
    client.from("reminders").select("id, satellite_id, label, pass_aos, fire_at").eq("user_id", userId),
  ]);
  if (station.error) throw new Error(station.error.message);
  if (logs.error) throw new Error(logs.error.message);
  if (reminders.error) throw new Error(reminders.error.message);
  const stationRow = station.data as StationRow | null;
  const logRows = (logs.data ?? []) as LogRow[];
  const reminderRows = (reminders.data ?? []) as ReminderRow[];
  if (!stationRow && logRows.length === 0 && reminderRows.length === 0) return null;
  if (!stationRow) throw new Error("This account has logs but no station.");
  return {
    profile: stationRow.profile,
    watchlist: stationRow.watchlist ?? [],
    alerts: stationRow.alerts,
    logs: logRows.map(logFromRow).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    reminders: reminderRows.map(reminderFromRow),
  };
}

function mergeLogs(local: ReceptionLog[], remote: ReceptionLog[]): ReceptionLog[] {
  const byId = new Map<string, ReceptionLog>();
  for (const log of remote) byId.set(log.id, log);
  for (const log of local) {
    const existing = byId.get(log.id);
    if (!existing || log.updatedAt > existing.updatedAt) byId.set(log.id, log);
  }
  return [...byId.values()].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

function mergeReminders(local: Reminder[], remote: Reminder[]): Reminder[] {
  const byId = new Map<string, Reminder>();
  for (const reminder of remote) byId.set(reminder.id, reminder);
  for (const reminder of local) byId.set(reminder.id, reminder);
  return [...byId.values()];
}

export function mergeAccount(local: Store, remote: Store | null): Store {
  if (!remote) return local;
  return {
    profile: remote.profile,
    alerts: { ...local.alerts, ...remote.alerts },
    watchlist: [...new Set([...remote.watchlist, ...local.watchlist])],
    logs: mergeLogs(local.logs, remote.logs),
    reminders: mergeReminders(local.reminders, remote.reminders),
  };
}

export async function pushAccount(client: SupabaseClient, userId: string, store: Store): Promise<void> {
  const station = await client.from("stations").upsert({
    user_id: userId,
    profile: store.profile,
    watchlist: store.watchlist,
    alerts: store.alerts,
    updated_at: new Date().toISOString(),
  });
  if (station.error) throw new Error(station.error.message);

  const existingLogs = await client.from("reception_logs").select("id").eq("user_id", userId);
  if (existingLogs.error) throw new Error(existingLogs.error.message);
  const logIds = new Set(store.logs.map((log) => log.id));
  const staleLogs = ((existingLogs.data ?? []) as { id: string }[]).map((row) => row.id).filter((id) => !logIds.has(id));
  if (staleLogs.length > 0) {
    const removed = await client.from("reception_logs").delete().in("id", staleLogs);
    if (removed.error) throw new Error(removed.error.message);
  }
  if (store.logs.length > 0) {
    const saved = await client.from("reception_logs").upsert(store.logs.map((log) => ({
      id: log.id,
      user_id: userId,
      satellite_id: log.satelliteId,
      transmitter_id: log.transmitterId,
      event_id: log.eventId,
      received_at: log.receivedAt,
      reception_status: log.receptionStatus,
      receiver_model_id: log.receiverModelId,
      antenna_model_id: log.antennaModelId,
      frequency_hz: log.frequencyHz,
      notes: log.notes,
      quality: log.quality,
      source_type: log.sourceType,
      verification_state: log.verificationState,
      created_at: log.createdAt,
      updated_at: log.updatedAt,
    })));
    if (saved.error) throw new Error(saved.error.message);
  }

  const existingReminders = await client.from("reminders").select("id").eq("user_id", userId);
  if (existingReminders.error) throw new Error(existingReminders.error.message);
  const reminderIds = new Set(store.reminders.map((reminder) => reminder.id));
  const staleReminders = ((existingReminders.data ?? []) as { id: string }[]).map((row) => row.id).filter((id) => !reminderIds.has(id));
  if (staleReminders.length > 0) {
    const removed = await client.from("reminders").delete().in("id", staleReminders);
    if (removed.error) throw new Error(removed.error.message);
  }
  if (store.reminders.length > 0) {
    const saved = await client.from("reminders").upsert(store.reminders.map((reminder) => ({
      id: reminder.id,
      user_id: userId,
      satellite_id: reminder.satelliteId,
      label: reminder.label,
      pass_aos: reminder.passAos,
      fire_at: reminder.fireAt,
    })));
    if (saved.error) throw new Error(saved.error.message);
  }
}
