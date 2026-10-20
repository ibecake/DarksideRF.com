import { Link } from "react-router-dom";
import { satelliteById } from "../data/catalogue";
import { events } from "../data/events";
import { sources } from "../data/sources";
import { formatFrequency } from "../lib/format";

export function EventsPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Activity</p>
      <h1>Events</h1>
      <p className="lede">Only announcements with a published source are listed. A date range is not an exact on-air schedule.</p>
      {events.map((event) => {
        const satellite = satelliteById(event.satelliteId);
        return (
          <article key={event.id} className="pass">
            <div className="pass-top">
              <h2>{event.title}</h2>
              <span className="pill received">Announced</span>
            </div>
            <p>{event.summary}</p>
            <p className="muted">
              {satellite?.name} · {formatFrequency(event.frequencyHz)} · {event.mode}
            </p>
            <p>
              {event.startDate} to {event.endDate}. Times: not published. Pattern: {event.pattern}
            </p>
            <ul>
              {event.sources.map((source) => (
                <li key={source.url}><a href={source.url}>{source.name}</a></li>
              ))}
            </ul>
            <Link to={`/satellite/${event.satelliteId}`}>Satellite record</Link>
          </article>
        );
      })}
      <h2>Sources the monitor will read</h2>
      <p className="muted">These are the first official and specialist pages. This site lists them and does not poll them yet, so nothing here is a live feed.</p>
      <ul className="logs">
        {sources.map((source) => (
          <li key={source.id}>
            <div>
              <strong><a href={source.url}>{source.name}</a></strong>
              <span>{source.category} · {source.language} · check about every {source.pollIntervalHours} hours</span>
              <span>{source.notes}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
