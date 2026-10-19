import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icons";
import { LogForm } from "../components/LogForm";
import { satelliteById } from "../data/catalogue";
import { useLogbook } from "../hooks/useStore";
import { achievementsFor, collectedSatelliteIds, decodedSatelliteIds, sstvDecodeCount } from "../lib/collection";
import { formatWhen } from "../lib/format";
import type { ReceptionLog } from "../types";

const exampleCards = [
  { name: "ISS", detail: "Voice / SSTV", status: "Decoded", icon: "satellite" as const, tone: "decoded" },
  { name: "AO-7", detail: "Amateur radio", status: "Received", icon: "antenna" as const, tone: "received" },
  { name: "CubeSat", detail: "Telemetry", status: "Received", icon: "signal" as const, tone: "received" },
  { name: "Weather Sat", detail: "Imagery", status: "Decoded", icon: "sun" as const, tone: "decoded" },
  { name: "LES-1", detail: "Zombie", status: "Undiscovered", icon: "orbit" as const, tone: "undiscovered" },
  { name: "New Signal", detail: "Unknown", status: "Undiscovered", icon: "unknown" as const, tone: "undiscovered" },
];

export function CollectionPage() {
  const { store, addLog, updateLog, deleteLog } = useLogbook();
  const [logging, setLogging] = useState(false);
  const [showExample, setShowExample] = useState(store.logs.length === 0);
  const collected = collectedSatelliteIds(store.logs);
  const decoded = decodedSatelliteIds(store.logs);
  const sstv = sstvDecodeCount(store.logs);
  const example = showExample && store.logs.length === 0;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Darkside RF / My collection</p>
          <h1>Signal Logbook</h1>
        </div>
        <span className="book">
          <Icon name="book" />
        </span>
      </div>
      <div className="stats">
        <Stat value={example ? "12" : String(collected.length)} label="Satellites" />
        <Stat value={example ? "28" : String(store.logs.length)} label="Reception logs" />
        <Stat value={example ? "3" : String(sstv)} label="SSTV images" />
      </div>
      <div className="section-line">
        <h2>My satellite collection</h2>
        {example ? <span className="example-tag">Example</span> : <button type="button" className="ghost" onClick={() => setLogging(true)}>Log reception</button>}
      </div>
      {example ? (
        <>
          <div className="card-grid">
            {exampleCards.map((card) => (
              <article key={card.name} className={`sat-card ${card.tone === "undiscovered" ? "dim" : ""}`}>
                <Icon name={card.icon} />
                <h3>{card.name}</h3>
                <p>{card.detail}</p>
                <span className={`pill ${card.tone}`}>{card.status}</span>
              </article>
            ))}
          </div>
          <p className="footnote">Illustrative collection with fictional user progress. Not live reception data.</p>
          <div className="row">
            <button type="button" onClick={() => { setShowExample(false); setLogging(true); }}>Start my logbook</button>
            <Link to="/collection/sets">Themed sets</Link>
          </div>
        </>
      ) : (
        <>
          {collected.length === 0 && <p className="muted">Nothing collected yet. A watchlist entry is not a reception.</p>}
          <div className="card-grid">
            {collected.map((id) => {
              const satellite = satelliteById(id);
              const logs = store.logs.filter((log) => log.satelliteId === id);
              const first = logs.reduce((earliest, log) => (log.receivedAt < earliest.receivedAt ? log : earliest));
              const isDecoded = decoded.includes(id);
              return (
                <Link key={id} to={`/satellite/${id}`} className="sat-card">
                  <Icon name={satellite?.zombie ? "orbit" : satellite?.category === "weather" ? "sun" : "satellite"} />
                  <h3>{satellite?.name ?? id}</h3>
                  <p>{satellite?.category ?? "Logged"}</p>
                  <span className={`pill ${isDecoded ? "decoded" : "received"}`}>{isDecoded ? "Decoded" : "Received"}</span>
                  <small>First log {formatWhen(first.receivedAt, store.profile.timeZone)}</small>
                </Link>
              );
            })}
          </div>
          <h2>Logs</h2>
          <ul className="logs">
            {store.logs.map((log) => (
              <LogRow key={log.id} log={log} timeZone={store.profile.timeZone} onStatus={(receptionStatus) => updateLog(log.id, { receptionStatus })} onDelete={() => deleteLog(log.id)} />
            ))}
          </ul>
          <h2>Achievements</h2>
          <ul className="achievements">
            {achievementsFor(store.logs).map((item) => (
              <li key={item.slug} className={item.earned ? "earned" : ""}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
          <Link to="/collection/sets">Themed sets</Link>
        </>
      )}
      {logging && <LogForm profile={store.profile} onSave={addLog} onClose={() => setLogging(false)} />}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function LogRow({ log, timeZone, onStatus, onDelete }: { log: ReceptionLog; timeZone: string; onStatus: (status: "received" | "decoded") => void; onDelete: () => void }) {
  const satellite = satelliteById(log.satelliteId);
  return (
    <li>
      <div>
        <strong>{satellite?.name ?? log.satelliteId}</strong>
        <span>{formatWhen(log.receivedAt, timeZone)} · {log.verificationState.replaceAll("_", " ")} · {log.sourceType === "manual_historical" ? "historical" : "live entry"}</span>
      </div>
      <div className="row">
        <button type="button" className="ghost" onClick={() => onStatus(log.receptionStatus === "decoded" ? "received" : "decoded")}>
          {log.receptionStatus === "decoded" ? "Mark received" : "Mark decoded"}
        </button>
        <button type="button" className="ghost" onClick={onDelete}>Delete</button>
      </div>
    </li>
  );
}
