import { useEffect, useRef, useState } from "react";
import { satelliteById, satellites } from "../data/catalogue";
import { antennas, bestStationAntenna, receivers } from "../data/equipment";
import { latestEventFor, liveEventFor } from "../data/events";
import { formatFrequency, formatUtc, zonedParts, zonedTimeToUtc } from "../lib/format";
import { eventOnlyTransmitter, orderedSignals, signalName } from "../lib/signals";
import type { Profile, ReceptionLog } from "../types";

interface Props {
  profile: Profile;
  initialSatelliteId?: string;
  initialTransmitterId?: string | null;
  initialFrequencyHz?: number | null;
  initialEventId?: string | null;
  onSave: (draft: Omit<ReceptionLog, "id" | "createdAt" | "updatedAt" | "verificationState">) => void;
  onClose: () => void;
}

function stamp(date: Date, timeZone: string): string {
  const parts = zonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function LogForm({ profile, initialSatelliteId, initialTransmitterId, initialFrequencyHz, initialEventId, onSave, onClose }: Props) {
  const dialog = useRef<HTMLFormElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [satelliteId, setSatelliteId] = useState(initialSatelliteId ?? satellites[0].id);
  const satellite = satelliteById(satelliteId) ?? satellites[0];
  const signals = orderedSignals(satellite, initialTransmitterId ?? null);
  const [transmitterId, setTransmitterId] = useState(initialTransmitterId ?? signals[0]?.id ?? "");
  const transmitter = satellite.transmitters.find((item) => item.id === transmitterId) ?? signals[0];
  const [status, setStatus] = useState<"received" | "decoded">("received");
  const [when, setWhen] = useState(() => stamp(new Date(), profile.timeZone));
  const [historical, setHistorical] = useState(false);
  const [notes, setNotes] = useState("");
  const live = liveEventFor(satellite.id, new Date());
  const finished = latestEventFor(satellite.id);

  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>("input")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="log-backdrop" onClick={onClose}>
      <form
        ref={dialog}
        className="log-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          const [date, time] = when.split("T");
          const [year, month, day] = date.split("-").map(Number);
          const [hour, minute] = time.split(":").map(Number);
          const frequencyHz = transmitter?.downlinkHz ?? initialFrequencyHz ?? null;
          const antenna = frequencyHz != null
            ? bestStationAntenna(profile.antennaIds, frequencyHz)
            : antennas.find((item) => profile.antennaIds.includes(item.id)) ?? null;
          onSave({
            satelliteId,
            transmitterId: transmitter?.id ?? null,
            eventId: live && transmitter && Math.abs(transmitter.downlinkHz - live.frequencyHz) <= 5_000 ? live.id : initialEventId ?? null,
            receivedAt: zonedTimeToUtc(year, month, day, hour, minute, profile.timeZone).toISOString(),
            receptionStatus: status,
            receiverModelId: profile.receiverIds[0] ?? null,
            antennaModelId: antenna?.id ?? profile.antennaIds[0] ?? null,
            frequencyHz,
            notes,
            quality: "",
            sourceType: historical ? "manual_historical" : "live_entry",
          });
          onClose();
        }}
      >
        <h3 id="log-title">What did you hear?</h3>
        <p className="muted">{satellite.name}. This saves your own note. It does not verify the signal.</p>
        {!initialSatelliteId && (
          <label>
            Satellite
            <select
              value={satelliteId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSatelliteId(nextId);
                const next = satelliteById(nextId);
                setTransmitterId(next?.transmitters[0]?.id ?? "");
              }}
            >
              {satellites.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        )}
        <fieldset>
          <legend>Signal</legend>
          {signals.map((item) => {
            const scheduled = eventOnlyTransmitter(item) && !(live && Math.abs(item.downlinkHz - live.frequencyHz) <= 5_000);
            return (
              <label key={item.id} className="signal-choice">
                <input
                  type="radio"
                  name="signal"
                  checked={transmitter?.id === item.id}
                  onChange={() => setTransmitterId(item.id)}
                />
                <span>
                  <strong>{signalName(item)}</strong>
                  <span className="muted"> {formatFrequency(item.downlinkHz)}</span>
                  {scheduled && finished?.endAt && (
                    <span className="muted"> — not scheduled. Last series ended {formatUtc(finished.endAt)}.</span>
                  )}
                  {scheduled && !finished?.endAt && <span className="muted"> — only during an announced series.</span>}
                </span>
              </label>
            );
          })}
        </fieldset>
        <label>
          When you heard it ({profile.timeZone})
          <input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required />
        </label>
        <div className="row">
          <button type="button" className="ghost" onClick={() => setWhen(stamp(new Date(), profile.timeZone))}>Just now</button>
        </div>
        <fieldset>
          <legend>What you got</legend>
          <label className="signal-choice">
            <input type="radio" name="status" checked={status === "received"} onChange={() => setStatus("received")} />
            <span>Heard it</span>
          </label>
          <label className="signal-choice">
            <input type="radio" name="status" checked={status === "decoded"} onChange={() => setStatus("decoded")} />
            <span>Decoded a picture or message</span>
          </label>
        </fieldset>
        <label>
          Notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Voice repeater, callsigns, noise" />
        </label>
        <label className="check">
          <span>
            <input type="checkbox" checked={historical} onChange={(event) => setHistorical(event.target.checked)} /> Historical entry, not from a pass happening now
          </span>
        </label>
        <p className="muted">
          Rig on this log: {receivers.find((item) => item.id === profile.receiverIds[0])?.name ?? "No receiver"} and{" "}
          {(transmitter
            ? bestStationAntenna(profile.antennaIds, transmitter.downlinkHz)
            : antennas.find((item) => profile.antennaIds.includes(item.id))
          )?.name ?? "No antenna"}.
        </p>
        <div className="row">
          <button type="submit">Save log</button>
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
