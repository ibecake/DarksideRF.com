export function formatFrequency(hz: number): string {
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(3)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(3)} MHz`;
  return `${(hz / 1e3).toFixed(1)} kHz`;
}

export function formatDial(hz: number): string {
  const abs = Math.abs(hz);
  const sign = hz < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(6)} GHz`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(4)} MHz`;
  return `${sign}${(abs / 1e3).toFixed(1)} kHz`;
}

export function formatSpan(hz: number): string {
  const abs = Math.abs(hz);
  if (abs >= 1e6) {
    const mhz = abs / 1e6;
    return `${Number.isInteger(mhz) ? mhz.toFixed(0) : mhz.toFixed(1)} MHz`;
  }
  if (abs >= 1000) {
    const khz = abs / 1000;
    return `${Number.isInteger(khz) ? khz.toFixed(0) : khz.toFixed(1)} kHz`;
  }
  return `${Math.round(abs)} Hz`;
}

export function formatWhen(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-IE", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatClock(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-IE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

export function formatAzimuth(degrees: number): string {
  return `${Math.round(degrees)}°`;
}

export function formatElevation(degrees: number): string {
  return `${Math.round(degrees)}°`;
}

export function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
  };
}

export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let utc = Date.UTC(year, month - 1, day, hour, minute);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(new Date(utc), timeZone);
    const rendered = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    const target = Date.UTC(year, month - 1, day, hour, minute);
    const delta = target - rendered;
    if (delta === 0) break;
    utc += delta;
  }
  return new Date(utc);
}

export function civilDate(iso: string, timeZone: string): string {
  const parts = zonedParts(new Date(iso), timeZone);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export function dopplerShiftHz(frequencyHz: number, factor: number): number {
  return Math.round(frequencyHz * (factor - 1));
}
