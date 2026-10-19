import { Link } from "react-router-dom";
import { catalogue, satellites } from "../data/catalogue";
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
          const primary = satellite.transmitters[0];
          return (
            <li key={satellite.id}>
              <Link to={`/satellite/${satellite.id}`}>
                <strong>{satellite.name}</strong>
                <span>{satellite.category} · NORAD {satellite.norad}{primary ? ` · ${formatFrequency(primary.downlinkHz)} ${primary.mode}` : ""}</span>
              </Link>
              {collected && <em>Collected</em>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
