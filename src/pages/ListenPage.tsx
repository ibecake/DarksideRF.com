import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LogForm } from "../components/LogForm";
import { PassSky } from "../components/PassSky";
import { TuningStrip } from "../components/TuningStrip";
import { heardReport, reportDate } from "../data/activity";
import { events } from "../data/events";
import { satelliteById, satellites } from "../data/catalogue";
import { antennaById, simplestAntenna, stationCovers } from "../data/equipment";
import { usePasses } from "../hooks/usePasses";
import { useLogbook } from "../hooks/useStore";
import { civilDate, dopplerShiftHz, formatAzimuth, formatClock, formatDuration, formatElevation, formatFrequency, formatWhen, zonedParts, zonedTimeToUtc } from "../lib/format";
import { expectedOutcome } from "../lib/outcome";
import { tleFor } from "../lib/tle";
import { sourceValidity, type SourceValidity } from "../lib/validity";
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
  const [reach, setReach] = useState<"all" | "receivable" | "hidden" | "heard">("all");
  const [record, setRecord] = useState<"all" | SourceValidity["label"]>("all");
  const [query, setQuery] = useState("");
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
    return cards.filter((card) => {
      if (reach === "receivable" && !card.receivable) return false;
      if (reach === "hidden" && card.receivable) return false;
      if (reach === "heard" && !heardReport(card.satellite.id)) return false;
      if (record !== "all" && sourceValidity(card.satellite).label !== record) return false;
      if (!needle) return true;
      return card.satellite.name.toLowerCase().includes(needle)
        || String(card.satellite.norad).includes(needle)
        || card.satellite.aliases.some((alias) => alias.toLowerCase().includes(needle));
    });
  }, [cards, query, reach, record]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Darkside RF / On air</p>
          <h1>What's on air</h1>
        </div>
      </div>
      <p className="lede">
        {profile.locationName}. A pass is geometry. It is not proof the satellite is transmitting. The label on each card is how solid the frequency record is, not a chance of hearing it.
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
      </div>
      <div className="filters">
        {([
          ["all", "All"],
          ["receivable", "Receivable"],
          ["hidden", "Not receivable"],
          ["heard", "Heard recently"],
        ] as const).map(([id, label]) => (
          <button key={id} className={reach === id ? "on" : "ghost"} type="button" onClick={() => setReach(id)}>
            {label}
          </button>
        ))}
        <Link to="/my-equipment">Change station</Link>
        <Link to="/learn">How to listen</Link>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search satellites" aria-label="Search satellites" />
      </div>
      <div className="filters">
        {([
          ["all", "All records"],
          ["Heard recently", "Heard recently"],
          ["Documented", "Documented"],
          ["Ageing record", "Ageing record"],
          ["Uncertain", "Uncertain"],
          ["Unlikely", "Unlikely"],
        ] as const).map(([id, label]) => (
          <button key={id} className={record === id ? "on" : "ghost"} type="button" onClick={() => setRecord(id)}>
            {label}
          </button>
        ))}
      </div>
      {pending && <p className="muted">Calculating passes in this browser… {completed > 0 ? `${completed} of ${total}` : ""}</p>}
      {shown.length === 0 && <p className="muted">No satellites match this filter.</p>}
      <div className="stack">
        {shown.map((card) => (
            <PassCard
              key={card.satellite.id}
              pass={card.pass}
              pending={pending}
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
              timeZone={profile.timeZone}
              minElevation={profile.minElevation}
              eventTitle={card.event?.title}
              watched={store.watchlist.includes(card.satellite.id)}
              onWatch={() => toggleWatch(card.satellite.id)}
              onRemind={() => {
                if (!card.pass) return;
                const fireAt = new Date(new Date(card.pass.aos).getTime() - 15 * 60_000).toISOString();
                addReminder({ satelliteId: card.satellite.id, label: `${card.satellite.name} in 15 minutes`, passAos: card.pass.aos, fireAt });
              }}
              onLog={() => setLogging({ satelliteId: card.satellite.id, transmitterId: card.transmitter?.id ?? null, eventId: card.event?.id ?? null })}
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
  pass: PassPrediction | null;
  pending: boolean;
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
  timeZone: string;
  minElevation: number;
  eventTitle?: string;
  watched: boolean;
  onWatch: () => void;
  onRemind: () => void;
  onLog: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shift = props.pass && props.transmitter ? dopplerShiftHz(props.transmitter.downlinkHz, props.pass.dopplerFactor) : null;
  const others = props.transmitters.filter((item) => item.id !== props.transmitter?.id);
  const outcome = props.transmitter ? expectedOutcome(props.transmitter) : null;
  const heard = heardReport(props.satelliteId);
  const validity = sourceValidity(satelliteById(props.satelliteId)!);
  return (
    <article
      className={`pass${open ? " is-open" : ""}`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea, .pass-detail")) return;
        setOpen((current) => !current);
      }}
    >
      <div className="pass-summary">
        <div className="pass-top">
          <div>
            <h2>
              <Link to={`/satellite/${props.satelliteId}`}>{props.name}</Link>
            </h2>
            <p className="muted">NORAD {props.norad}</p>
          </div>
          <span className="pass-pills">
            <span className={`pill ${props.receivable ? "decoded" : "missing"}`}>{props.receivable ? "Receivable" : "Not receivable"}</span>
            <span className={`pill ${validity.tone}`}>{validity.label}</span>
          </span>
        </div>
        <p className="pass-facts">
          {props.transmitter && <span>{formatFrequency(props.transmitter.downlinkHz)}</span>}
          {props.transmitter?.mode && <span>{props.transmitter.mode}</span>}
          {outcome && <span>{outcome.label}</span>}
          {heard && <span>Heard {reportDate(heard.latest)}</span>}
        </p>
        {props.pass ? (
          <p className="when">
            {formatWhen(props.pass.aos, props.timeZone)} – {formatClock(props.pass.los, props.timeZone)} · max {formatElevation(props.pass.maxElevation)}
          </p>
        ) : props.pending ? (
          <p className="muted">Calculating this pass…</p>
        ) : (
          <p className="muted">No pass above {props.minElevation}° in this window.</p>
        )}
        <div className="row pass-actions">
          <button
            type="button"
            className="ghost pass-more"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? "Hide" : "Details"}
          </button>
          <button
            type="button"
            className="ghost pass-more"
            onClick={() => {
              const satellite = satelliteById(props.satelliteId);
              if (!satellite) return;
              const text = tleFor(satellite);
              const finish = () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              };
              navigator.clipboard.writeText(text).then(finish).catch(() => {
                const area = document.createElement("textarea");
                area.value = text;
                area.setAttribute("readonly", "");
                area.style.position = "fixed";
                area.style.left = "-9999px";
                document.body.appendChild(area);
                area.select();
                const ok = document.execCommand("copy");
                area.remove();
                if (ok) finish();
              });
            }}
          >
            {copied ? "TLE copied" : "Copy TLE"}
          </button>
        </div>
      </div>
      {open && <div className="pass-detail">
      {props.transmitter && <TuningStrip transmitter={props.transmitter} dialHz={shift === null ? null : props.transmitter.downlinkHz + shift} />}
      {others.length > 0 && (
        <p className="also muted">
          <span className="also-label">Also</span>
          {others.slice(0, 4).map((item) => (
            <span key={item.id}>{formatFrequency(item.downlinkHz)} {expectedOutcome(item).label}</span>
          ))}
          {others.length > 4 && <span>+{others.length - 4} more</span>}
        </p>
      )}
      <div className="pass-layout">
        <div>
          <dl className="tune">
            {props.pass && (
              <>
                <div><dt>AOS</dt><dd>{formatAzimuth(props.pass.aosAzimuth)}</dd></div>
                <div><dt>Max</dt><dd>{formatElevation(props.pass.maxElevation)}</dd></div>
                <div><dt>LOS</dt><dd>{formatAzimuth(props.pass.losAzimuth)}</dd></div>
                <div><dt>Duration</dt><dd>{formatDuration(props.pass.durationSec)}</dd></div>
              </>
            )}
            {props.transmitter?.description && (
              <div className="tune-span"><dt>Signal</dt><dd>{props.transmitter.description}</dd></div>
            )}
            {props.pass && props.transmitter && (
              <>
                <div><dt>Receiver</dt><dd>{props.receiverName}</dd></div>
                <div><dt>Antenna</dt><dd>{props.antennaName}</dd></div>
                {shift !== null && (
                  <div><dt>Doppler</dt><dd>{shift > 0 ? "+" : ""}{(shift / 1000).toFixed(1)} kHz</dd></div>
                )}
                {props.receiverName === "No compatible receiver" && (
                  <div className="tune-span tune-note-cell"><dt>Fit</dt><dd>None of the selected receivers cover this downlink.</dd></div>
                )}
                {props.suitability === "Extra Equipment Required" && props.receiverName !== "No compatible receiver" && (
                  <div className="tune-span tune-note-cell"><dt>Fit</dt><dd>{props.receiverName} can tune this. {props.antennaName} is outside its useful bands.</dd></div>
                )}
              </>
            )}
            {props.suggested && (
              <div className={props.ownedAntenna ? undefined : "tune-warn"}>
                <dt>Suggested</dt>
                <dd><Link to={`/antennas/${props.suggested.id}`}>{props.suggested.name}</Link></dd>
              </div>
            )}
          </dl>
          {props.eventTitle && <p className="event-note">Potential opportunity. {props.eventTitle} has dates, not an exact on-air time.</p>}
          {props.pass && props.pass.orbitAgeDays > 10 && <p className="event-note">Orbital elements are {Math.round(props.pass.orbitAgeDays)} days old. Do not treat this time as precise.</p>}
        </div>
        {props.pass && (
          <Link to={`/map?satellite=${props.satelliteId}`} className="sky-link" aria-label={`Show ${props.name} on the world map`}>
            <PassSky
              aosAzimuth={props.pass.aosAzimuth}
              maxAzimuth={props.pass.maxAzimuth}
              losAzimuth={props.pass.losAzimuth}
              maxElevation={props.pass.maxElevation}
              minElevation={props.minElevation}
            />
          </Link>
        )}
      </div>
      <div className="row">
        <button type="button" className="ghost" onClick={props.onRemind} disabled={!props.pass}>Remind me</button>
        <button type="button" className="ghost" onClick={props.onWatch}>{props.watched ? "On watchlist" : "Add to watchlist"}</button>
        <button type="button" className="ghost" onClick={props.onLog}>Log reception</button>
      </div>
      </div>}
    </article>
  );
}

