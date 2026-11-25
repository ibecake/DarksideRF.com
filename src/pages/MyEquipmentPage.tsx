import { Link } from "react-router-dom";
import { antennas, isDishAntenna, receivers } from "../data/equipment";
import { useLogbook } from "../hooks/useStore";

const wireAntennas = antennas.filter((antenna) => !isDishAntenna(antenna));
const dishAntennas = antennas.filter((antenna) => isDishAntenna(antenna));

export function MyEquipmentPage() {
  const { store, updateProfile } = useLogbook();
  const { profile } = store;
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / My station</p>
      <h1>Station</h1>
      <p className="lede">
        Stored in this browser. Pick every receiver and antenna you actually use — a handheld Yagi and a Discovery Dish can live on the same station.
      </p>
      <form
        className="log-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const antennaIds = antennas.filter((antenna) => data.getAll("antenna").includes(antenna.id)).map((antenna) => antenna.id);
          updateProfile({
            ...profile,
            locationName: String(data.get("locationName") || "Observer"),
            latitude: Number(data.get("latitude")),
            longitude: Number(data.get("longitude")),
            timeZone: String(data.get("timeZone") || "Europe/Dublin"),
            minElevation: Number(data.get("minElevation")),
            receiverIds: receivers.filter((receiver) => data.getAll("receiver").includes(receiver.id)).map((receiver) => receiver.id),
            antennaIds: antennaIds.length ? antennaIds : profile.antennaIds,
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
            <label key={receiver.id} className="check-row">
              <input type="checkbox" name="receiver" value={receiver.id} defaultChecked={profile.receiverIds.includes(receiver.id)} />
              <span>{receiver.name}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Antennas</legend>
          <p className="muted">Select every antenna on the station. Coverage uses any selected antenna that reaches the downlink.</p>
          {wireAntennas.map((antenna) => (
            <label key={antenna.id} className="check-row">
              <input type="checkbox" name="antenna" value={antenna.id} defaultChecked={profile.antennaIds.includes(antenna.id)} />
              <span>{antenna.name}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Dishes</legend>
          <p className="muted">Discovery Dish feeds are listed separately — tick the feed you have fitted.</p>
          {dishAntennas.map((antenna) => (
            <label key={antenna.id} className="check-row">
              <input type="checkbox" name="antenna" value={antenna.id} defaultChecked={profile.antennaIds.includes(antenna.id)} />
              <span>{antenna.name}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit">Save station</button>
      </form>
      <p><Link to="/settings/alerts">Alert preferences</Link></p>
    </section>
  );
}
