import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LogForm } from "../components/LogForm";
import { events } from "../data/events";
import { satelliteById } from "../data/catalogue";
import { antennaById } from "../data/equipment";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { civilDate, dopplerShiftHz, formatAzimuth, formatClock, formatDuration, formatElevation, formatFrequency, formatWhen, zonedParts, zonedTimeToUtc } from "../lib/format";
import { howToListen } from "../lib/guidance";
import { assess, bestTransmitter } from "../lib/listenability";
import type { PassPrediction, TimeWindow, Transmitter } from "../types";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [logging, setLogging] = useState<{ satelliteId: string; transmitterId: string; eventId: string | null } | null>(null);
  const range = useMemo(() => rangeFor(window, profile.timeZone), [window, profile.timeZone]);
  const { passes, pending } = usePasses({
    latitude: profile.latitude,
    longitude: profile.longitude,
    heightKm: profile.heightKm,
    startMs: range.start.getTime(),
    endMs: range.end.getTime(),
    minElevation: profile.minElevation,
  });

  const cards = useMemo(() => {
    return passes.flatMap((pass) => {
      const satellite = satelliteById(pass.satelliteId);
      if (!satellite || satellite.transmitters.length === 0) return [];
      const ranked = satellite.transmitters.map((transmitter) => ({
        transmitter,
        assessment: assess(transmitter, pass, profile.receiverIds, profile.antennaId),
      }));
      const best = bestTransmitter(ranked);
      if (!best) return [];
      const date = civilDate(pass.aos, profile.timeZone);
      const event = events.find((item) => item.satelliteId === satellite.id && date >= item.startDate && date <= item.endDate);
      return [{ pass, satellite, ...best, event }];
    });
  }, [passes, profile.antennaId, profile.receiverIds, profile.timeZone]);

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
      </div>
      {pending && <p className="muted">Calculating passes…</p>}
      {!pending && cards.length === 0 && <p className="muted">Nothing in this window clears {profile.minElevation}° with a catalogued downlink.</p>}
      <div className="stack">
        {cards.map((card) => (
          <PassCard
            key={`${card.pass.aos}-${card.transmitter.id}`}
            pass={card.pass}
            name={card.satellite.name}
            satelliteId={card.satellite.id}
            norad={card.satellite.norad}
            transmitter={card.transmitter}
            suitability={card.assessment.suitability}
            receiverName={card.assessment.receiver?.name ?? "No compatible receiver"}
            antennaName={antennaById(profile.antennaId)?.name ?? "Antenna"}
            reasons={card.assessment.reasons}
            timeZone={profile.timeZone}
            eventTitle={card.event?.title}
            watched={store.watchlist.includes(card.satellite.id)}
            guideOpen={openId === `${card.pass.aos}-${card.transmitter.id}`}
            onGuide={() => setOpenId((current) => (current === `${card.pass.aos}-${card.transmitter.id}` ? null : `${card.pass.aos}-${card.transmitter.id}`))}
            onWatch={() => toggleWatch(card.satellite.id)}
            onRemind={() => {
              const fireAt = new Date(new Date(card.pass.aos).getTime() - 15 * 60_000).toISOString();
              addReminder({ satelliteId: card.satellite.id, label: `${card.satellite.name} in 15 minutes`, passAos: card.pass.aos, fireAt });
            }}
            onLog={() => setLogging({ satelliteId: card.satellite.id, transmitterId: card.transmitter.id, eventId: card.event?.id ?? null })}
          />
        ))}
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
  pass: PassPrediction;
  name: string;
  satelliteId: string;
  norad: number;
  transmitter: Transmitter;
  suitability: string;
  receiverName: string;
  antennaName: string;
  reasons: string[];
  timeZone: string;
  eventTitle?: string;
  watched: boolean;
  guideOpen: boolean;
  onGuide: () => void;
  onWatch: () => void;
  onRemind: () => void;
  onLog: () => void;
}) {
  const shift = dopplerShiftHz(props.transmitter.downlinkHz, props.pass.dopplerFactor);
  return (
    <article className="pass">
      <div className="pass-top">
        <div>
          <h2>
            <Link to={`/satellite/${props.satelliteId}`}>{props.name}</Link>
          </h2>
          <p className="muted">
            NORAD {props.norad} · {formatFrequency(props.transmitter.downlinkHz)} {props.transmitter.mode}
          </p>
        </div>
        <span className={`pill ${pillClass(props.suitability)}`}>{props.suitability}</span>
      </div>
      <p className="when">
        {formatWhen(props.pass.aos, props.timeZone)} – {formatClock(props.pass.los, props.timeZone)}
      </p>
      <p>
        AOS {formatAzimuth(props.pass.aosAzimuth)} · max {formatElevation(props.pass.maxElevation)} · LOS {formatAzimuth(props.pass.losAzimuth)} · {formatDuration(props.pass.durationSec)}
      </p>
      <p className="muted">{props.transmitter.description}</p>
      <p className="muted">
        {props.receiverName === "No compatible receiver"
          ? "None of the selected receivers cover this downlink."
          : props.suitability === "Extra Equipment Required"
            ? `${props.receiverName} can tune this, but ${props.antennaName} is outside its useful bands.`
            : `Best rig in this profile: ${props.receiverName} with ${props.antennaName}.`}
        {" "}Estimated Doppler one minute before the highest point: {shift > 0 ? "+" : ""}
        {(shift / 1000).toFixed(1)} kHz.
      </p>
      {props.eventTitle && <p className="event-note">Potential opportunity. {props.eventTitle} has dates, not an exact on-air time.</p>}
      {props.pass.orbitAgeDays > 10 && <p className="event-note">Orbital elements are {Math.round(props.pass.orbitAgeDays)} days old. Do not treat this time as precise.</p>}
      <div className="row">
        <button type="button" onClick={props.onGuide}>How to listen</button>
        <button type="button" className="ghost" onClick={props.onRemind}>Remind me</button>
        <button type="button" className="ghost" onClick={props.onWatch}>{props.watched ? "On watchlist" : "Add to watchlist"}</button>
        <button type="button" className="ghost" onClick={props.onLog}>Log reception</button>
      </div>
      {props.guideOpen && (
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

function pillClass(suitability: string): string {
  if (suitability === "Good Candidate") return "decoded";
  if (suitability === "Extra Equipment Required") return "undiscovered";
  return "received";
}
