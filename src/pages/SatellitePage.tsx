import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LogForm } from "../components/LogForm";
import { PassSky } from "../components/PassSky";
import { catalogue, satelliteById } from "../data/catalogue";
import { simplestAntenna, stationCovers } from "../data/equipment";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { formatFrequency, formatWhen } from "../lib/format";
import { howToListen } from "../lib/guidance";

export function SatellitePage() {
  const { id = "" } = useParams();
  const satellite = satelliteById(id);
  const { store, addLog, toggleWatch } = useLogbook();
  const [logging, setLogging] = useState(false);
  const [transmitterId, setTransmitterId] = useState<string | null>(null);
  const [windowStart] = useState(() => Date.now());
  const { passes, pending } = usePasses({
    latitude: store.profile.latitude,
    longitude: store.profile.longitude,
    heightKm: store.profile.heightKm,
    startMs: windowStart,
    endMs: windowStart + 48 * 3_600_000,
    minElevation: store.profile.minElevation,
    satelliteIds: satellite ? [satellite.id] : [],
  });
  if (!satellite) return <section className="panel"><h1>Unknown satellite</h1><Link to="/satellites">Back to the catalogue</Link></section>;
  const logs = store.logs.filter((log) => log.satelliteId === satellite.id);
  const watched = store.watchlist.includes(satellite.id);
  const receivable = satellite.transmitters.some((item) => stationCovers(store.profile.receiverIds, store.profile.antennaId, item.downlinkHz));
  const focus = satellite.transmitters.find((item) => stationCovers(store.profile.receiverIds, store.profile.antennaId, item.downlinkHz)) ?? satellite.transmitters[0];
  const suggested = focus ? simplestAntenna(focus.downlinkHz) : null;
  const nextPass = passes[0];

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Satellite</p>
      <h1>{satellite.name}</h1>
      <p className="lede">{satellite.summary}</p>
      <p className="muted">NORAD {satellite.norad} · {satellite.cospar} · {satellite.operator}</p>
      <p className="muted">Status in this catalogue: {satellite.status}. That describes the mission record, not a live transmitter check.</p>
      <div className="row">
        <span className={`pill ${receivable ? "decoded" : "missing"}`}>{receivable ? "Receivable" : "Not receivable"}</span>
        {suggested && (
          <Link className={`pill ${store.profile.antennaId === suggested.id ? "decoded" : "missing"}`} to={`/antennas/${suggested.id}`}>
            {suggested.name}
          </Link>
        )}
      </div>
      {nextPass && (
        <PassSky
          aosAzimuth={nextPass.aosAzimuth}
          maxAzimuth={nextPass.maxAzimuth}
          losAzimuth={nextPass.losAzimuth}
          maxElevation={nextPass.maxElevation}
          minElevation={store.profile.minElevation}
        />
      )}
      <div className="row">
        <button type="button" onClick={() => { setTransmitterId(satellite.transmitters[0]?.id ?? null); setLogging(true); }}>Log reception</button>
        <button type="button" className="ghost" onClick={() => toggleWatch(satellite.id)}>{watched ? "On watchlist" : "Add to watchlist"}</button>
      </div>
      <h2>Downlinks</h2>
      <p className="muted">From SatNOGS, retrieved {catalogue.retrievedAt}. Only cited active records are shown.</p>
      <ul className="transmitters">
        {satellite.transmitters.map((transmitter) => (
          <li key={transmitter.id}>
            <div>
              <strong>{formatFrequency(transmitter.downlinkHz)} {transmitter.mode}</strong>
              <span>{transmitter.description}</span>
              <a href={transmitter.citation}>Source</a>
            </div>
            <button type="button" className="ghost" onClick={() => { setTransmitterId(transmitter.id); setLogging(true); }}>Log this</button>
          </li>
        ))}
      </ul>
      {transmitterId && (
        <ul className="guide">
          {howToListen(satellite.transmitters.find((item) => item.id === transmitterId)?.mode ?? null, satellite.transmitters.find((item) => item.id === transmitterId)?.description ?? null).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <h2>Orbit</h2>
      <p className="muted">CelesTrak GP element set. Epoch {satellite.omm.EPOCH}. Retrieved {catalogue.retrievedAt}.</p>
      <h2>Next passes above {store.profile.minElevation}°</h2>
      {pending && <p className="muted">Calculating…</p>}
      <ul className="logs">
        {passes.slice(0, 8).map((pass) => (
          <li key={pass.aos}>
            <div>
              <strong>{formatWhen(pass.aos, store.profile.timeZone)}</strong>
              <span>Max elevation {Math.round(pass.maxElevation)}°. {pass.orbitAgeDays > 10 ? "Elements are old." : "Elements are current in this snapshot."}</span>
            </div>
          </li>
        ))}
      </ul>
      <h2>Your logs</h2>
      {logs.length === 0 && <p className="muted">{watched ? "Discovered, not received." : "Not collected."}</p>}
      <ul className="logs">
        {logs.map((log) => (
          <li key={log.id}><div><strong>{log.receptionStatus}</strong><span>{formatWhen(log.receivedAt, store.profile.timeZone)}</span></div></li>
        ))}
      </ul>
      {logging && (
        <LogForm
          profile={store.profile}
          initialSatelliteId={satellite.id}
          initialTransmitterId={transmitterId}
          onSave={addLog}
          onClose={() => setLogging(false)}
        />
      )}
    </section>
  );
}
