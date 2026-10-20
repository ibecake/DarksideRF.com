import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { satelliteById } from "../data/catalogue";
import { huntBrief, huntRole, huntSources } from "../data/hunt";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { dopplerShiftHz, formatElevation, formatFrequency, formatWhen } from "../lib/format";
import { orbitAgeDays, sourceValidity } from "../lib/validity";

const ladder = [
  ["Candidate", "An unusual signal was saved, with a time and a frequency."],
  ["Correlated", "The frequency track follows the Doppler curve predicted for this orbit and this station."],
  ["Repeated", "The same kind of track appears on more than one pass."],
  ["Identified", "Something independent ties the signal to this satellite: a Morse identity, decoded telemetry, a known modulation, or two stations seeing the Doppler shift that each location predicts."],
];

export function HuntCasePage() {
  const { id = "" } = useParams();
  const satellite = satelliteById(id);
  const { store } = useLogbook();
  const [start] = useState(() => Date.now());
  const { passes, pending } = usePasses({
    latitude: store.profile.latitude,
    longitude: store.profile.longitude,
    heightKm: store.profile.heightKm,
    startMs: start,
    endMs: start + 48 * 3_600_000,
    minElevation: store.profile.minElevation,
    satelliteIds: satellite ? [satellite.id] : [],
  });
  if (!satellite || !huntRole(satellite)) {
    return <section className="panel"><h1>Not a hunt candidate</h1><Link to="/hunt">Back to Zombie Hunter</Link></section>;
  }
  const validity = sourceValidity(satellite);
  const age = orbitAgeDays(satellite.omm.EPOCH);
  const logs = store.logs.filter((log) => log.satelliteId === satellite.id);
  const primary = satellite.transmitters[0];
  const shift = passes[0] && primary ? dopplerShiftHz(primary.downlinkHz, passes[0].dopplerFactor) : null;

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Zombie Hunter</p>
      <h1>{satellite.name}</h1>
      <p className="lede">{huntBrief(satellite)}</p>
      <p className="muted">NORAD {satellite.norad} · {huntRole(satellite)} · {satellite.operator}</p>
      <p><span className={`pill ${validity.tone}`}>{validity.label}</span></p>
      <p>{validity.detail}</p>
      <p className="muted">
        Elements epoch {satellite.omm.EPOCH.slice(0, 16).replace("T", " ")} UTC, about {Math.max(0, Math.round(age))} day{Math.round(age) === 1 ? "" : "s"} old.
        {age > 10 ? " These elements are old enough that a low-orbit pass time should not be treated as precise." : " This pass uses the latest tracked elements in the snapshot."}
      </p>
      {shift !== null && primary && (
        <p className="muted">Predicted Doppler on {formatFrequency(primary.downlinkHz)}, one minute before the next peak: {shift > 0 ? "+" : ""}{(shift / 1000).toFixed(1)} kHz. That is a prediction from the orbit, not a trace from a recording.</p>
      )}

      <h2>Published downlinks</h2>
      <ul className="logs">
        {satellite.transmitters.map((transmitter) => (
          <li key={transmitter.id}>
            <div>
              <strong>{formatFrequency(transmitter.downlinkHz)} {transmitter.mode}</strong>
              <span>{transmitter.description}</span>
              {transmitter.citation.startsWith("http") && <a href={transmitter.citation}>Source</a>}
            </div>
          </li>
        ))}
      </ul>
      <ul>
        {huntSources(satellite).filter((source) => !satellite.transmitters.some((transmitter) => transmitter.citation === source.url)).map((source) => (
          <li key={source.url}><a href={source.url}>{source.name}</a></li>
        ))}
      </ul>

      <h2>What would count</h2>
      <p className="muted">DarksideRF has no recording attached to this spacecraft. A self-reported log is not one of these four steps.</p>
      <ul className="logs">
        {ladder.map(([title, text]) => (
          <li key={title}><div><strong>{title}</strong><span>{text}</span></div></li>
        ))}
      </ul>
      {logs.length > 0 && <p>This logbook has {logs.length} self-reported {logs.length === 1 ? "entry" : "entries"} for {satellite.name}. That stays a personal note until a recording is compared with the predicted Doppler curve.</p>}

      <h2>Before calling it silent</h2>
      <ul>
        <li>Try a sunlit pass and an eclipsed pass. A solar-powered transmitter can be off in shadow.</li>
        <li>Prefer a higher pass when you can.</li>
        <li>A tumbling craft can fade and return. Fading is a clue, not proof of tumbling.</li>
        <li>An old transmitter can sit off the published frequency.</li>
        <li>One station is a start. A second station should see a different Doppler shift.</li>
      </ul>

      <h2>Next search windows</h2>
      {pending && <p className="muted">Calculating…</p>}
      {!pending && passes.length === 0 && <p className="muted">Nothing above {store.profile.minElevation}° in the next 48 hours.</p>}
      <ul className="logs">
        {passes.slice(0, 8).map((pass) => (
          <li key={pass.aos}>
            <div>
              <strong>{formatWhen(pass.aos, store.profile.timeZone)}</strong>
              <span>max {formatElevation(pass.maxElevation)} · {Math.round(pass.durationSec / 60)} min</span>
            </div>
          </li>
        ))}
      </ul>
      <p><Link to={`/satellite/${satellite.id}`}>Satellite record</Link> · <Link to="/hunt">All candidates</Link></p>
    </section>
  );
}
