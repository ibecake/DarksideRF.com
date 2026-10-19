import { useEffect } from "react";
import { useLogbook } from "../hooks/useStore";
import { zonedParts } from "../lib/format";

function inQuiet(date: Date, start: string, end: string, timeZone: string): boolean {
  const parts = zonedParts(date, timeZone);
  const minutes = parts.hour * 60 + parts.minute;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const quietStart = startHour * 60 + startMinute;
  const quietEnd = endHour * 60 + endMinute;
  if (quietStart <= quietEnd) return minutes >= quietStart && minutes < quietEnd;
  return minutes >= quietStart || minutes < quietEnd;
}

export function ReminderWatcher() {
  const { store } = useLogbook();
  useEffect(() => {
    if (!store.alerts.browser || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers = store.reminders.map((reminder) => {
      const delay = new Date(reminder.fireAt).getTime() - Date.now();
      if (delay < 0 || delay > 12 * 3_600_000) return 0;
      return window.setTimeout(() => {
        if (inQuiet(new Date(), store.alerts.quietStart, store.alerts.quietEnd, store.profile.timeZone)) return;
        new Notification(reminder.label);
      }, delay);
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [store.alerts.browser, store.alerts.quietEnd, store.alerts.quietStart, store.profile.timeZone, store.reminders]);
  return null;
}
