import { Link } from "react-router-dom";
import { satelliteById } from "../data/catalogue";
import { events } from "../data/events";
import { sources } from "../data/sources";
import { formatFrequency, formatUtc } from "../lib/format";

export function EventsPage() {
  const now = new Date();
  const live = events.filter((event) => {
    if (event.status !== "announced") return false;
    if (event.startAt && event.endAt) {
      const time = now.getTime();
      return time >= Date.parse(event.startAt) && time <= Date.parse(event.endAt);
    }
    const day = now.toISOString().slice(0, 10);
    return day >= event.startDate && day <= event.endDate;
  });
  const finished = events.filter((event) => !live.includes(event));

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Activity</p>
      <h1>Events</h1>
      {live.length === 0 ? (
        <p className="lede">No SSTV event is scheduled. A finished series is not a reason to expect pictures on the next pass.</p>
      ) : (
        <p className="lede">A published window is not an exact on-air schedule, and it does not mean the transmitter is on for every pass.</p>
      )}
      {live.map((event) => <EventCard key={event.id} eventId={event.id} ended={false} />)}
      {finished.length > 0 && <h2>Latest finished series</h2>}
      {finished.map((event) => <EventCard key={event.id} eventId={event.id} ended />)}
      <h2>Sources the monitor will read</h2>
      <p className="muted">These are the first official and specialist pages. This site lists them and does not poll them yet, so nothing here is a live feed.</p>
      <ul className="logs">
        {sources.map((source) => (
          <li key={source.id}>
            <div>
              <strong><a href={source.url}>{source.name}</a></strong>
              <span>{source.category} · {source.language} · {source.schedule}</span>
              <span>{source.notes}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EventCard({ eventId, ended }: { eventId: string; ended: boolean }) {
  const event = events.find((item) => item.id === eventId);
  if (!event) return null;
  const satellite = satelliteById(event.satelliteId);
  const window = event.startAt && event.endAt
    ? `${formatUtc(event.startAt)} to ${formatUtc(event.endAt)}`
    : `${event.startDate} to ${event.endDate}. Times were not published.`;
  return (
    <article className="pass">
      <div className="pass-top">
        <h2>{event.title}</h2>
        <span className={`pill ${ended ? "missing" : "received"}`}>{ended ? "Ended" : "Announced"}</span>
      </div>
      <p>{event.summary}</p>
      <p className="muted">
        {satellite?.name} · {formatFrequency(event.frequencyHz)} · {event.mode}
      </p>
      <p>{window}. Pattern: {event.pattern}</p>
      <ul>
        {event.sources.map((source) => (
          <li key={source.url}><a href={source.url}>{source.name}</a></li>
        ))}
      </ul>
      <Link to={`/satellite/${event.satelliteId}`}>Satellite record</Link>
    </article>
  );
}
