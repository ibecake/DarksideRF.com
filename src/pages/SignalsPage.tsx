import { Link } from "react-router-dom";
import { satellites } from "../data/catalogue";
import { howToListen } from "../lib/guidance";

export function SignalsPage() {
  const groups = new Map<string, { satelliteId: string; name: string; description: string | null }[]>();
  for (const satellite of satellites) {
    for (const transmitter of satellite.transmitters) {
      const mode = transmitter.mode ?? "Other";
      const list = groups.get(mode) ?? [];
      list.push({ satelliteId: satellite.id, name: satellite.name, description: transmitter.description });
      groups.set(mode, list);
    }
  }
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Signals</p>
      <h1>Signal types</h1>
      <p className="lede">Grouped from the cited downlinks in this catalogue. Audio samples are not bundled.</p>
      {[...groups.entries()].map(([mode, items]) => (
        <article key={mode} className="pass">
          <h2>{mode}</h2>
          <ul className="guide">
            {howToListen(mode, items[0]?.description ?? null).slice(0, 3).map((line) => <li key={line}>{line}</li>)}
          </ul>
          <ul>
            {items.map((item) => (
              <li key={`${item.satelliteId}-${item.description}`}>
                <Link to={`/satellite/${item.satelliteId}`}>{item.name}</Link>
                <span className="muted"> — {item.description}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
