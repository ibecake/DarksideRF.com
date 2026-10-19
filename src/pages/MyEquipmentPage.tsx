import { Link } from "react-router-dom";
import { antennas, receivers } from "../data/equipment";
import { useLogbook } from "../hooks/useStore";

export function MyEquipmentPage() {
  const { store, updateProfile } = useLogbook();
  const { profile } = store;
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / My station</p>
      <h1>Station</h1>
      <p className="lede">Stored in this browser. The starting profile is Cork with a HackRF One, an SDRplay RSPduo, and a VHF/UHF whip.</p>
      <form
        className="log-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          updateProfile({
            ...profile,
            locationName: String(data.get("locationName") || "Observer"),
            latitude: Number(data.get("latitude")),
            longitude: Number(data.get("longitude")),
            timeZone: String(data.get("timeZone") || "Europe/Dublin"),
            minElevation: Number(data.get("minElevation")),
            receiverIds: receivers.filter((receiver) => data.getAll("receiver").includes(receiver.id)).map((receiver) => receiver.id),
            antennaId: String(data.get("antenna") || profile.antennaId),
          });
        }}
      >
        <label>Place<input name="locationName" defaultValue={profile.locationName} /></label>
        <label>Latitude<input name="latitude" type="number" step="0.0001" defaultValue={profile.latitude} /></label>
        <label>Longitude<input name="longitude" type="number" step="0.0001" defaultValue={profile.longitude} /></label>
        <label>Time zone<input name="timeZone" defaultValue={profile.timeZone} /></label>
        <label>Minimum elevation (°)<input name="minElevation" type="number" min={0} max={80} defaultValue={profile.minElevation} /></label>
        <fieldset>
          <legend>Receivers</legend>
          {receivers.map((receiver) => (
            <label key={receiver.id}>
              <input type="checkbox" name="receiver" value={receiver.id} defaultChecked={profile.receiverIds.includes(receiver.id)} /> {receiver.name}
            </label>
          ))}
        </fieldset>
        <label>
          Antenna
          <select name="antenna" defaultValue={profile.antennaId}>
            {antennas.map((antenna) => <option key={antenna.id} value={antenna.id}>{antenna.name}</option>)}
          </select>
        </label>
        <button type="submit">Save station</button>
      </form>
      <p><Link to="/settings/alerts">Alert preferences</Link></p>
    </section>
  );
}
