import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LogForm } from "../components/LogForm";
import { PassSky } from "../components/PassSky";
import { TuningStrip } from "../components/TuningStrip";
import { events } from "../data/events";
import { satellites } from "../data/catalogue";
import { antennaById, simplestAntenna, stationCovers } from "../data/equipment";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { civilDate, dopplerShiftHz, formatAzimuth, formatClock, formatDuration, formatElevation, formatFrequency, formatWhen, zonedParts, zonedTimeToUtc } from "../lib/format";
import { howToListen } from "../lib/guidance";
import { assess, bestTransmitter } from "../lib/listenability";
import type { AntennaModel, PassPrediction, TimeWindow, Transmitter } from "../types";

function rangeFor(window: TimeWindow, timeZone: string) {
  const now = new Date();
  if (window === "now") return { start: new Date(now.getTime() - 15 * 60_000), end: new Date(now.getTime() + 45 * 60_000) };
  if (window === "6h") return { start: now, end: new Date(now.getTime() + 6 * 3_600_000) };
  if (window === "7d") return { start: now, end: new Date(now.getTime() + 7 * 86_400_000) };
  const parts = zonedParts(now, timeZone);
  if (parts.hour < 18) {
    return {
      start: zonedTimeToUtc(parts.year, parts.month, parts.day, 18, 0, timeZone),
      end: zonedTimeToUtc(parts.year, parts.month, parts.day, 23, 59, timeZone),
    };
  }
  const next = zonedParts(new Date(now.getTime() + 24 * 3_600_000), timeZone);
  return { start: now, end: zonedTimeToUtc(next.year, next.month, next.day, 6, 0, timeZone) };
}

export function ListenPage() {
  const { store, toggleWatch, addLog, addReminder } = useLogbook();
  const { profile } = store;
  const [window, setWindow] = useState<TimeWindow>("6h");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [logging, setLogging] = useState<{ satelliteId: string; transmitterId: string | null; eventId: string | null } | null>(null);
  const range = useMemo(() => rangeFor(window, profile.timeZone), [window, profile.timeZone]);
  const { passes, pending, completed, total } = usePasses({
    latitude: profile.latitude,
    longitude: profile.longitude,
    heightKm: profile.heightKm,
    startMs: range.start.getTime(),
    endMs: range.end.getTime(),
    minElevation: profile.minElevation,
  });

  const cards = useMemo(() => {
    const nextPass = new Map<string, PassPrediction>();
    for (const pass of passes) {
      if (!nextPass.has(pass.satelliteId)) nextPass.set(pass.satelliteId, pass);
    }
    return satellites.map((satellite) => {
      const pass = nextPass.get(satellite.id) ?? null;
      const ranked = pass
        ? satellite.transmitters.map((transmitter) => ({
            transmitter,
            assessment: assess(transmitter, pass, profile.receiverIds, profile.antennaId),
          }))
        : [];
      const best = bestTransmitter(ranked);
      const transmitter = best?.transmitter ?? satellite.transmitters[0] ?? null;
      const receivable = satellite.transmitters.some((item) => stationCovers(profile.receiverIds, profile.antennaId, item.downlinkHz));
      const suggested = transmitter ? simplestAntenna(transmitter.downlinkHz) : null;
      const date = pass ? civilDate(pass.aos, profile.timeZone) : "";
      const event = pass ? events.find((item) => item.satelliteId === satellite.id && date >= item.startDate && date <= item.endDate) : undefined;
      return { satellite, pass, transmitter, assessment: best?.assessment ?? null, receivable, suggested, event };
    }).sort((a, b) => {
      if (a.pass && b.pass) return a.pass.aos.localeCompare(b.pass.aos);
      if (a.pass) return -1;
      if (b.pass) return 1;
      return a.satellite.name.localeCompare(b.satellite.name);
    });
  }, [passes, profile.antennaId, profile.receiverIds, profile.timeZone]);
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return cards;
    return cards.filter((card) =>
      card.satellite.name.toLowerCase().includes(needle)
      || String(card.satellite.norad).includes(needle)
      || card.satellite.aliases.some((alias) => alias.toLowerCase().includes(needle)),
    );
  }, [cards, query]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Darkside RF / On air</p>
          <h1>What's on air</h1>
        </div>
      </div>
      <p className="lede">
        {profile.locationName}. A pass is geometry. It is not proof the satellite is transmitting.
      </p>
      <div className="filters">
        {([
          ["now", "Now"],
          ["6h", "Next 6 hours"],
          ["tonight", "Tonight"],
          ["7d", "Next 7 days"],
        ] as const).map(([id, label]) => (
          <button key={id} className={window === id ? "on" : "ghost"} type="button" onClick={() => setWindow(id)}>
            {label}
          </button>
        ))}
        <Link to="/my-equipment">Change station</Link>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search satellites" aria-label="Search satellites" />
      </div>
      {pending && <p className="muted">Calculating passes… {completed > 0 ? `${completed} of ${total}` : ""}</p>}
      <div className="stack">
        {shown.map((card) => {
          const cardId = `${card.satellite.id}-${card.pass?.aos ?? "none"}`;
          return (
            <PassCard
              key={card.satellite.id}
              pass={card.pass}
              name={card.satellite.name}
              satelliteId={card.satellite.id}
              norad={card.satellite.norad}
              transmitter={card.transmitter}
              transmitters={card.satellite.transmitters}
              suitability={card.assessment?.suitability}
              receiverName={card.assessment?.receiver?.name ?? "No compatible receiver"}
              antennaName={antennaById(profile.antennaId)?.name ?? "Antenna"}
              suggested={card.suggested}
              ownedAntenna={card.suggested?.id === profile.antennaId}
              receivable={card.receivable}
              reasons={card.assessment?.reasons ?? []}
              timeZone={profile.timeZone}
              minElevation={profile.minElevation}
              eventTitle={card.event?.title}
              watched={store.watchlist.includes(card.satellite.id)}
              guideOpen={openId === cardId}
              onGuide={() => setOpenId((current) => (current === cardId ? null : cardId))}
              onWatch={() => toggleWatch(card.satellite.id)}
              onRemind={() => {
                if (!card.pass) return;
                const fireAt = new Date(new Date(card.pass.aos).getTime() - 15 * 60_000).toISOString();
                addReminder({ satelliteId: card.satellite.id, label: `${card.satellite.name} in 15 minutes`, passAos: card.pass.aos, fireAt });
              }}
              onLog={() => setLogging({ satelliteId: card.satellite.id, transmitterId: card.transmitter?.id ?? null, eventId: card.event?.id ?? null })}
            />
          );
        })}
      </div>
      {logging && (
        <LogForm
          profile={profile}
          initialSatelliteId={logging.satelliteId}
          initialTransmitterId={logging.transmitterId}
          initialEventId={logging.eventId}
          onSave={addLog}
          onClose={() => setLogging(null)}
        />
      )}
    </section>
  );
}

function PassCard(props: {
  pass: PassPrediction | null;
  name: string;
  satelliteId: string;
  norad: number;
  transmitter: Transmitter | null;
  transmitters: Transmitter[];
  suitability?: string;
  receiverName: string;
  antennaName: string;
  suggested: AntennaModel | null;
  ownedAntenna: boolean;
  receivable: boolean;
  reasons: string[];
  timeZone: string;
  minElevation: number;
  eventTitle?: string;
  watched: boolean;
  guideOpen: boolean;
  onGuide: () => void;
  onWatch: () => void;
  onRemind: () => void;
  onLog: () => void;
}) {
  const shift = props.pass && props.transmitter ? dopplerShiftHz(props.transmitter.downlinkHz, props.pass.dopplerFactor) : null;
  const others = props.transmitters.filter((item) => item.id !== props.transmitter?.id);
  return (
    <article className="pass">
      <div className="pass-top">
        <div>
          <h2>
            <Link to={`/satellite/${props.satelliteId}`}>{props.name}</Link>
          </h2>
          <p className="muted">NORAD {props.norad}</p>
        </div>
        <span className={`pill ${props.receivable ? "decoded" : "missing"}`}>{props.receivable ? "Receivable" : "Not receivable"}</span>
      </div>
      {props.transmitter && <TuningStrip transmitter={props.transmitter} dialHz={shift === null ? null : props.transmitter.downlinkHz + shift} />}
      {others.length > 0 && (
        <p className="muted">
          Also {others.slice(0, 4).map((item) => `${formatFrequency(item.downlinkHz)} ${item.mode ?? ""}`.trim()).join(" · ")}
          {others.length > 4 ? ` · +${others.length - 4} more` : ""}
        </p>
      )}
      <div className="pass-layout">
        <div>
          {props.pass ? (
            <>
              <p className="when">
                {formatWhen(props.pass.aos, props.timeZone)} – {formatClock(props.pass.los, props.timeZone)}
              </p>
              <p>
                AOS {formatAzimuth(props.pass.aosAzimuth)} · max {formatElevation(props.pass.maxElevation)} · LOS {formatAzimuth(props.pass.losAzimuth)} · {formatDuration(props.pass.durationSec)}
              </p>
            </>
          ) : (
            <p className="muted">No pass above {props.minElevation}° in this window.</p>
          )}
          {props.transmitter && <p className="muted">{props.transmitter.description}</p>}
          {props.pass && props.transmitter && (
            <p className="muted">
              {props.receiverName === "No compatible receiver"
                ? "None of the selected receivers cover this downlink."
                : props.suitability === "Extra Equipment Required"
                  ? `${props.receiverName} can tune this, but ${props.antennaName} is outside its useful bands.`
                  : `Best rig in this profile: ${props.receiverName} with ${props.antennaName}.`}
              {shift !== null && ` Estimated Doppler one minute before the highest point: ${shift > 0 ? "+" : ""}${(shift / 1000).toFixed(1)} kHz.`}
            </p>
          )}
          {props.suggested && (
            <p>
              <Link className={`pill ${props.ownedAntenna ? "decoded" : "missing"}`} to={`/antennas/${props.suggested.id}`}>
                {props.suggested.name}
              </Link>
            </p>
          )}
          {props.eventTitle && <p className="event-note">Potential opportunity. {props.eventTitle} has dates, not an exact on-air time.</p>}
          {props.pass && props.pass.orbitAgeDays > 10 && <p className="event-note">Orbital elements are {Math.round(props.pass.orbitAgeDays)} days old. Do not treat this time as precise.</p>}
        </div>
        {props.pass && (
          <PassSky
            aosAzimuth={props.pass.aosAzimuth}
            maxAzimuth={props.pass.maxAzimuth}
            losAzimuth={props.pass.losAzimuth}
            maxElevation={props.pass.maxElevation}
            minElevation={props.minElevation}
          />
        )}
      </div>
      <div className="row">
        <button type="button" onClick={props.onGuide} disabled={!props.transmitter}>How to listen</button>
        <button type="button" className="ghost" onClick={props.onRemind} disabled={!props.pass}>Remind me</button>
        <button type="button" className="ghost" onClick={props.onWatch}>{props.watched ? "On watchlist" : "Add to watchlist"}</button>
        <button type="button" className="ghost" onClick={props.onLog}>Log reception</button>
      </div>
      {props.guideOpen && props.transmitter && (
        <ul className="guide">
          {howToListen(props.transmitter.mode, props.transmitter.description).map((line) => (
            <li key={line}>{line}</li>
          ))}
          {props.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

