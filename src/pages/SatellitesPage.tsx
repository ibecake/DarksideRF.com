import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TleBlock } from "../components/TleBlock";
import { catalogue, satellites } from "../data/catalogue";
import { simplestAntenna, stationCovers } from "../data/equipment";
import { useLogbook } from "../hooks/useStore";
import { formatFrequency } from "../lib/format";
import { catalogueTle } from "../lib/tle";

export function SatellitesPage() {
  const { store } = useLogbook();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return satellites;
    return satellites.filter((satellite) =>
      satellite.name.toLowerCase().includes(needle)
      || String(satellite.norad).includes(needle)
      || satellite.aliases.some((alias) => alias.toLowerCase().includes(needle))
      || satellite.transmitters.some((item) => formatFrequency(item.downlinkHz).toLowerCase().includes(needle)),
    );
  }, [query]);
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Catalogue</p>
      <h1>Satellites</h1>
      <p className="lede">{satellites.length.toLocaleString()} satellites with an active SatNOGS downlink and a current CelesTrak orbit. A listing is a frequency record. It is not a promise the transmitter is on.</p>
      <p><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, NORAD, or frequency" aria-label="Search satellites" /></p>
      <TleBlock text={catalogueTle(satellites)} fileName="darksiderf.tle" preview={false} label="Copy all TLEs" />
      <p className="muted">The file is a GPredict catalogue: one name and two element lines for each satellite.</p>
      <p className="muted">Orbits: {catalogue.orbitSource}. Transmitters: {catalogue.transmitterSource}. Snapshot {catalogue.retrievedAt}.</p>
      <ul className="directory">
        {shown.map((satellite) => {
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
