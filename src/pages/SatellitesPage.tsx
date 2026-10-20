import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TleBlock } from "../components/TleBlock";
import { activity, heardReport, publishedMhz, reportDate } from "../data/activity";
import { catalogue, satellites } from "../data/catalogue";
import { simplestAntenna, stationCovers } from "../data/equipment";
import { useLogbook } from "../hooks/useStore";
import { formatFrequency } from "../lib/format";
import { sourceValidity } from "../lib/validity";
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
      <p className="lede">A SatNOGS record is a documented downlink. An AMSAT report is someone hearing it. A pass still needs a current orbit.</p>
      <div className="stats quad">
        <div><strong>{satellites.length.toLocaleString()}</strong><span>Trackable</span></div>
        <div><strong>{activity.heard.length}</strong><span>Heard in 30 days</span></div>
        <div><strong>{activity.je9pelActiveMissing.length}</strong><span>JE9PEL, not tracked</span></div>
        <div><strong>{activity.je9pelExtraOnTracked.length}</strong><span>Extra JE9PEL frequencies</span></div>
      </div>
      <div className="sources">
        <p className="muted">Trackable means an active SatNOGS downlink and a current CelesTrak orbit, retrieved {catalogue.retrievedAt}. Heard means an AMSAT status report of Heard, Telemetry Only, or Crew Active in the 30 days before {activity.retrievedAt.slice(0, 10)}.</p>
        <h2>Published, no current orbit</h2>
        <p className="muted">These {activity.je9pelActiveMissing.length} are active on the <a href={activity.je9pelUrl}>JE9PEL frequency list</a> and have no orbit here. There is no pass to calculate. The frequency is a published figure, not a hearing, so the source is unvalidated for listening.</p>
        <details>
          <summary>Show the {activity.je9pelActiveMissing.length} names</summary>
          <ul>
            {activity.je9pelActiveMissing.map((item) => (
              <li key={item.norad}><strong>{item.name}</strong> <span>NORAD {item.norad} · {publishedMhz(item.mhz)} · {item.mode || "mode unpublished"}</span> <span className="pill missing">No orbit</span></li>
            ))}
          </ul>
        </details>
        <details>
          <summary>JE9PEL frequencies on satellites we already track ({activity.je9pelExtraOnTracked.length})</summary>
          <p className="muted">These are at least 5 kHz from the SatNOGS downlink stored here. The SatNOGS record remains the one used for passes.</p>
          <ul>
            {activity.je9pelExtraOnTracked.map((item) => (
              <li key={`${item.satelliteId}-${item.mhz}-${item.mode}`}>
                <Link to={`/satellite/${item.satelliteId}`}>{item.name}</Link>
                <span> {publishedMhz(item.mhz)} · {item.mode || "mode unpublished"} · JE9PEL name {item.je9pelName}</span>
              </li>
            ))}
          </ul>
        </details>
        <p className="muted">The <a href={activity.r4uabFrequencyUrl}>R4UAB frequency table</a> is dated {activity.r4uabFrequencyDated}. It is a cross-check, so those rows are not merged into the trackable list. IARU coordination, SONIKS, and RadioScanner are not in this snapshot.</p>
      </div>
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
          const heard = heardReport(satellite.id);
          return (
            <li key={satellite.id}>
              <Link to={`/satellite/${satellite.id}`}>
                <strong>{satellite.name}</strong>
                <span>{satellite.category} · NORAD {satellite.norad}{primary ? ` · ${formatFrequency(primary.downlinkHz)} ${primary.mode}` : ""}</span>
              </Link>
              <span className={`pill ${receivable ? "decoded" : "missing"}`}>{receivable ? "Receivable" : "Not receivable"}</span>
              <span className={`pill ${sourceValidity(satellite).tone}`}>{sourceValidity(satellite).label}</span>
              {heard && <span className="pill received">Heard {reportDate(heard.latest)}</span>}
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
