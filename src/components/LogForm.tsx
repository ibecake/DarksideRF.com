import { useState } from "react";
import { satelliteById, satellites } from "../data/catalogue";
import { antennas, receivers } from "../data/equipment";
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

export function LogForm({ profile, initialSatelliteId, initialTransmitterId, initialFrequencyHz, initialEventId, onSave, onClose }: Props) {
  const [satelliteId, setSatelliteId] = useState(initialSatelliteId ?? satellites[0].id);
  const satellite = satelliteById(satelliteId) ?? satellites[0];
  const [transmitterId, setTransmitterId] = useState(initialTransmitterId ?? satellite.transmitters[0]?.id ?? "");
  const transmitter = satellite.transmitters.find((item) => item.id === transmitterId) ?? satellite.transmitters[0];
  const [status, setStatus] = useState<"received" | "decoded">("received");
  const [when, setWhen] = useState(new Date().toISOString().slice(0, 16));
  const [historical, setHistorical] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <form
      className="log-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          satelliteId,
          transmitterId: transmitter?.id ?? null,
          eventId: initialEventId ?? null,
          receivedAt: new Date(when).toISOString(),
          receptionStatus: status,
          receiverModelId: profile.receiverIds[0] ?? null,
          antennaModelId: profile.antennaId,
          frequencyHz: transmitter?.downlinkHz ?? initialFrequencyHz ?? null,
          notes,
          quality: "",
          sourceType: historical ? "manual_historical" : "live_entry",
        });
        onClose();
      }}
    >
      <h3>Log reception</h3>
      <p className="muted">Self-reported. A saved log is not a verified reception.</p>
      <label>
        Satellite
        <select
          value={satelliteId}
          onChange={(event) => {
            setSatelliteId(event.target.value);
            const next = satelliteById(event.target.value);
            setTransmitterId(next?.transmitters[0]?.id ?? "");
          }}
        >
          {satellites.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Downlink
        <select value={transmitter?.id ?? ""} onChange={(event) => setTransmitterId(event.target.value)}>
          {satellite.transmitters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.description ?? item.mode}
            </option>
          ))}
        </select>
      </label>
      <label>
        When
        <input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} required />
      </label>
      <fieldset>
        <label>
          <input type="radio" name="status" checked={status === "received"} onChange={() => setStatus("received")} /> Heard or detected
        </label>
        <label>
          <input type="radio" name="status" checked={status === "decoded"} onChange={() => setStatus("decoded")} /> Decoded
        </label>
      </fieldset>
      <label>
        <input type="checkbox" checked={historical} onChange={(event) => setHistorical(event.target.checked)} /> Historical entry, not from a pass happening now
      </label>
      <label>
        Notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
      </label>
      <p className="muted">
        Rig on this log: {receivers.find((item) => item.id === profile.receiverIds[0])?.name ?? "No receiver"} and{" "}
        {antennas.find((item) => item.id === profile.antennaId)?.name}.
      </p>
      <div className="row">
        <button type="submit">Save log</button>
        <button type="button" className="ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
