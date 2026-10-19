import type { ListeningEvent } from "../types";

export const events: ListeningEvent[] = [
  {
    id: "ariss-sstv-series-34",
    type: "sstv",
    title: "ARISS SSTV Series 34 — ARISS Hardware",
    satelliteId: "iss",
    frequencyHz: 437_550_000,
    mode: "SSTV Robot 36",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    timePrecision: "date",
    status: "announced",
    pattern: "About 36 seconds on, then about two minutes off.",
    summary:
      "ARISS has announced the dates for Expedition 75 Series 34 and the downlink used for these events. Exact UTC start and end times were still to be updated on the ARISS page. These dates do not mean the transmitter is on for the whole window.",
    sources: [
      {
        name: "ARISS upcoming SSTV events",
        url: "https://www.ariss.org/upcoming-sstv-events.html",
      },
    ],
  },
];

export function eventById(id: string): ListeningEvent | undefined {
  return events.find((event) => event.id === id);
}
