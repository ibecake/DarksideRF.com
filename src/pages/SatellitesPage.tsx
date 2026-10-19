import { Link } from "react-router-dom";
import { catalogue, satellites } from "../data/catalogue";
import { simplestAntenna, stationCovers } from "../data/equipment";
import { useLogbook } from "../hooks/useStore";
import { formatFrequency } from "../lib/format";

export function SatellitesPage() {
  const { store } = useLogbook();
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Catalogue</p>
      <h1>Satellites</h1>
      <p className="lede">A first catalogue of {satellites.length} satellites with a cited SatNOGS downlink and a current CelesTrak element set. Not every satellite in orbit, and not a claim that each one is transmitting now.</p>
      <p className="muted">Orbits: {catalogue.orbitSource}. Transmitters: {catalogue.transmitterSource}. Snapshot {catalogue.retrievedAt}.</p>
      <ul className="directory">
        {satellites.map((satellite) => {
          const collected = store.logs.some((log) => log.satelliteId === satellite.id);
          const primary = satellite.transmitters.find((item) => stationCovers(store.profile.receiverIds, store.profile.antennaId, item.downlinkHz)) ?? satellite.transmitters[0];
          const receivable = satellite.transmitters.some((item) => stationCovers(store.profile.receiverIds, store.profile.antennaId, item.downlinkHz));
          const suggested = primary ? simplestAntenna(primary.downlinkHz) : null;
          return (
            <li key={satellite.id}>
              <Link to={`/satellite/${satellite.id}`}>
                <strong>{satellite.name}</strong>
                <span>{satellite.category} · NORAD {satellite.norad}{primary ? ` · ${formatFrequency(primary.downlinkHz)} ${primary.mode}` : ""}</span>
              </Link>
              <span className={`pill ${receivable ? "decoded" : "missing"}`}>{receivable ? "Receivable" : "Not receivable"}</span>
              {suggested && (
                <Link className={`pill ${store.profile.antennaId === suggested.id ? "decoded" : "missing"}`} to={`/antennas/${suggested.id}`}>
                  {suggested.name}
                </Link>
              )}
              {collected && <em>Collected</em>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
