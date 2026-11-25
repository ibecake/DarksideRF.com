import type { ListeningEvent } from "../types";

// Copied from the ARISS upcoming-events page. A finished series is not a current transmission.
export const events: ListeningEvent[] = [
  {
    id: "ariss-sstv-series-35",
    type: "sstv",
    title: "ARISS SSTV Series 35 — Space Memories",
    satelliteId: "iss",
    frequencyHz: 437_550_000,
    mode: "SSTV Robot 36",
    startDate: "2026-11-09",
    endDate: "2026-11-16",
    startAt: "2026-11-09T17:45:00Z",
    endAt: "2026-11-16T08:15:00Z",
    timePrecision: "instant",
    status: "finished",
    pattern: "About 36 seconds on, then about two minutes off.",
    summary:
      "ARISS published this series from 9 November 2026 17:45 UTC until 16 November 2026 08:15 UTC, on 437.550 MHz in Robot 36. The upcoming-events page lists nothing after it.",
    sources: [
      {
        name: "ARISS upcoming SSTV events",
        url: "https://www.ariss.org/upcoming-sstv-events.html",
      },
      {
        name: "ARISS news release 26-67",
        url: "https://www.ariss.org/press-releases/ariss-news-release-no-26-67-ariss-series-35-sstv-event-scheduled-for-november-9-16",
      },
    ],
  },
];

export function eventById(id: string): ListeningEvent | undefined {
  return events.find((event) => event.id === id);
}

export function eventIsLive(event: ListeningEvent, at: Date): boolean {
  if (event.status !== "announced") return false;
  if (event.startAt && event.endAt) {
    const time = at.getTime();
    return time >= Date.parse(event.startAt) && time <= Date.parse(event.endAt);
  }
  const day = at.toISOString().slice(0, 10);
  return day >= event.startDate && day <= event.endDate;
}

export function liveEventFor(satelliteId: string, at: Date): ListeningEvent | undefined {
  return events.find((event) => event.satelliteId === satelliteId && eventIsLive(event, at));
}

export function latestEventFor(satelliteId: string): ListeningEvent | undefined {
  return events
    .filter((event) => event.satelliteId === satelliteId)
    .sort((a, b) => (b.endAt ?? b.endDate).localeCompare(a.endAt ?? a.endDate))[0];
}
