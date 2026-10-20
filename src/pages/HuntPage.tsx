import { useState } from "react";
import { Link } from "react-router-dom";
import { satellites } from "../data/catalogue";
import { huntCandidates, huntRole } from "../data/hunt";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { formatElevation, formatFrequency, formatWhen } from "../lib/format";
import { sourceValidity } from "../lib/validity";

const candidates = huntCandidates();

export function HuntPage() {
  const { store } = useLogbook();
  const [start] = useState(() => Date.now());
  const { passes, pending } = usePasses({
    latitude: store.profile.latitude,
    longitude: store.profile.longitude,
    heightKm: store.profile.heightKm,
    startMs: start,
    endMs: start + 48 * 3_600_000,
    minElevation: store.profile.minElevation,
    satelliteIds: candidates.map((satellite) => satellite.id),
  });

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Zombie Hunter</p>
      <h1>Zombie Hunter</h1>
      <p className="lede">A search for a transmission from a spacecraft that was believed to have gone quiet. A pass is a time to listen. It is not a detection.</p>

      <article className="pass">
        <h2>Three different facts</h2>
        <p><strong>Dead transmitter.</strong> The spacecraft is no longer expected to transmit.</p>
        <p><strong>Lost or inactive spacecraft.</strong> It may still be in orbit and able to transmit now and then.</p>
        <p><strong>Unidentified signal.</strong> Something moved like a satellite on the waterfall, and no satellite has been tied to it.</p>
        <p className="muted">No unidentified track is stored here yet. A sloping line by itself is not an identification. Local oscillators, interference, and other moving transmitters can slope too.</p>
      </article>

      <article className="pass">
        <h2>How a search works</h2>
        <p><strong>Targeted.</strong> The satellite, a published frequency, and a current orbit are known. Listen during the pass for a carrier that follows the predicted Doppler curve.</p>
        <p><strong>Blind.</strong> Watch a band, save a timestamped waterfall, and compare a moving carrier with the passes of known satellites. That detector is not running. A capture stays on your receiver until you log what you heard.</p>
        <p className="muted">If the object is still tracked, the pass uses the latest elements. A decades-old element set is kept for history. It is a poor predictor of where a low satellite is today, because drag and a small mean-motion error add up.</p>
      </article>

      <h2>Candidates in this catalogue</h2>
      <p className="muted">These are the satellites already marked intermittent, degraded, historical, or zombie, and that still have a current orbit. The other {(satellites.length - candidates.length).toLocaleString()} tracked satellites stay on Listen and Satellites, each with a source label. A missing AMSAT report is not proof of silence.</p>
      <ul className="directory">
        {candidates.map((satellite) => {
          const validity = sourceValidity(satellite);
          const primary = satellite.transmitters[0];
          return (
            <li key={satellite.id}>
              <Link to={`/hunt/${satellite.id}`}>
                <strong>{satellite.name}</strong>
                <span>{huntRole(satellite)} · NORAD {satellite.norad}{primary ? ` · ${formatFrequency(primary.downlinkHz)} ${primary.mode ?? ""}` : ""}</span>
              </Link>
              <span className={`pill ${validity.tone}`}>{validity.label}</span>
            </li>
          );
        })}
      </ul>

      <h2>Search windows</h2>
      <p className="muted">Next 48 hours above {store.profile.minElevation}° at {store.profile.locationName}. Sunlit and eclipsed passes are both worth keeping. One quiet pass does not retire a candidate.</p>
      {pending && <p className="muted">Calculating these passes…</p>}
      {!pending && passes.length === 0 && <p className="muted">None of these candidates are above {store.profile.minElevation}° in the next 48 hours.</p>}
      <ul className="logs">
        {passes.map((pass) => {
          const satellite = candidates.find((item) => item.id === pass.satelliteId);
          return (
            <li key={`${pass.satelliteId}-${pass.aos}`}>
              <div>
                <strong><Link to={`/hunt/${pass.satelliteId}`}>{satellite?.name ?? pass.satelliteId}</Link></strong>
                <span>{formatWhen(pass.aos, store.profile.timeZone)} · max {formatElevation(pass.maxElevation)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
