import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TleBlock } from "../components/TleBlock";
import { landPath } from "../data/landPath";
import { satelliteById, satellites } from "../data/catalogue";
import { useLogbook } from "../hooks/useStore";
import { formatAzimuth, formatClock, formatElevation } from "../lib/format";
import { whereSatellites, type SatelliteFix } from "../lib/position";
import { tleFor } from "../lib/tle";

function project(latitude: number, longitude: number): [number, number] {
  return [longitude + 180, 90 - latitude];
}

function skyPoint(azimuth: number, elevation: number, center: number, radius: number): [number, number] {
  const reach = ((90 - Math.max(0, Math.min(90, elevation))) / 90) * radius;
  const radians = (azimuth * Math.PI) / 180;
  return [center + reach * Math.sin(radians), center - reach * Math.cos(radians)];
}

function trackSegments(points: SatelliteFix[]): SatelliteFix[][] {
  const segments: SatelliteFix[][] = [];
  let current: SatelliteFix[] = [];
  for (const point of points) {
    const previous = current[current.length - 1];
    if (previous && Math.abs(point.longitude - previous.longitude) > 180) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

export function MapPage() {
  const { store } = useLogbook();
  const { profile } = store;
  const [now, setNow] = useState(() => new Date());
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const fixes = useMemo(
    () => whereSatellites(satellites, now, profile.latitude, profile.longitude, profile.heightKm),
    [now, profile.latitude, profile.longitude, profile.heightKm],
  );
  const overhead = useMemo(
    () => fixes.filter((fix) => fix.elevation >= profile.minElevation).sort((a, b) => b.elevation - a.elevation),
    [fixes, profile.minElevation],
  );
  const plotted = showAll ? fixes : fixes.filter((fix) => fix.elevation >= 0);
  const selected = fixes.find((fix) => fix.id === selectedId) ?? overhead[0] ?? null;
  const selectedSatellite = selected ? satelliteById(selected.id) : undefined;
  const track = useMemo(() => {
    if (!selectedSatellite) return [];
    const points: SatelliteFix[] = [];
    for (let minute = -45; minute <= 45; minute += 3) {
      const [fix] = whereSatellites([selectedSatellite], new Date(now.getTime() + minute * 60_000), profile.latitude, profile.longitude, profile.heightKm);
      if (fix) points.push(fix);
    }
    return points;
  }, [selectedSatellite, now, profile.latitude, profile.longitude, profile.heightKm]);

  const you = project(profile.latitude, profile.longitude);
  const size = 168;
  const center = size / 2;
  const radius = 68;

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Map</p>
      <h1>Where they are</h1>
      <p className="lede">
        Positions from the CelesTrak snapshot, drawn for {profile.locationName} at {formatClock(now.toISOString(), profile.timeZone)}.
        Green satellites are at least {profile.minElevation}° above your horizon.
      </p>
      <div className="row">
        <button type="button" className={showAll ? "on" : "ghost"} onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Showing every satellite" : "Show satellites below the horizon"}
        </button>
        <span className="muted">{overhead.length} above {profile.minElevation}° · {fixes.filter((fix) => fix.elevation >= 0).length} above the horizon</span>
      </div>
      <svg className="world" viewBox="0 0 360 180" role="img" aria-label="World map of current satellite positions">
        {[0, 30, 60, 90, 120, 150, 180].map((line) => <line key={`h${line}`} className="grid" x1="0" x2="360" y1={line} y2={line} />)}
        {[0, 60, 120, 180, 240, 300, 360].map((line) => <line key={`v${line}`} className="grid" y1="0" y2="180" x1={line} x2={line} />)}
        <path className="land" d={landPath} />
        {trackSegments(track).map((segment) => (
          <polyline key={segment[0].longitude} className="track" points={segment.map((point) => project(point.latitude, point.longitude).join(",")).join(" ")} />
        ))}
        {plotted.map((fix) => {
          const [x, y] = project(fix.latitude, fix.longitude);
          const up = fix.elevation >= profile.minElevation;
          return (
            <circle
              key={fix.id}
              className={fix.id === selected?.id ? "picked" : up ? "up" : "down"}
              cx={x}
              cy={y}
              r={fix.id === selected?.id ? 2.4 : up ? 1.7 : 1}
              onClick={() => setSelectedId(fix.id)}
            >
              <title>{fix.name} · {formatAzimuth(fix.azimuth)} · {formatElevation(fix.elevation)}</title>
            </circle>
          );
        })}
        <circle className="you" cx={you[0]} cy={you[1]} r="1.8" />
        <text className="you-label" x={you[0] + 2.5} y={you[1] - 2}>{profile.locationName}</text>
      </svg>
      <div className="map-layout">
        <figure className="sky now-sky">
          <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Satellites above the station">
            <circle className="ring" cx={center} cy={center} r={radius} />
            <circle className="ring" cx={center} cy={center} r={radius / 3} />
            <circle className="ring" cx={center} cy={center} r={(radius * 2) / 3} />
            <path className="ring" d={`M ${center} ${center - radius} L ${center} ${center + radius} M ${center - radius} ${center} L ${center + radius} ${center}`} />
            <text x={center} y="14">N</text>
            <text x={size - 12} y={center + 4}>E</text>
            <text x={center} y={size - 4}>S</text>
            <text x="6" y={center + 4}>W</text>
            {overhead.map((fix) => {
              const [x, y] = skyPoint(fix.azimuth, fix.elevation, center, radius);
              return (
                <circle key={fix.id} className={fix.id === selected?.id ? "picked" : "mark"} cx={x} cy={y} r={fix.id === selected?.id ? 4.2 : 2.6} onClick={() => setSelectedId(fix.id)}>
                  <title>{fix.name}</title>
                </circle>
              );
            })}
          </svg>
          <figcaption>Look direction from {profile.locationName}. Center is overhead.</figcaption>
        </figure>
        <div>
          <h2>Above {profile.minElevation}°</h2>
          {overhead.length === 0 && <p className="muted">Nothing in the catalogue is that high right now.</p>}
          <ul className="directory">
            {overhead.slice(0, 12).map((fix) => (
              <li key={fix.id}>
                <button type="button" className="ghost map-pick" onClick={() => setSelectedId(fix.id)}>
                  <strong>{fix.name}</strong>
                  <span>{formatAzimuth(fix.azimuth)} · {formatElevation(fix.elevation)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {selected && selectedSatellite && (
        <div className="pass">
          <h2>{selected.name}</h2>
          <p>
            {formatAzimuth(selected.azimuth)} · {formatElevation(selected.elevation)} · ground point {selected.latitude.toFixed(1)}°, {selected.longitude.toFixed(1)}°
          </p>
          <p><Link to={`/satellite/${selected.id}`}>Open the satellite page</Link></p>
          <TleBlock text={tleFor(selectedSatellite)} fileName={`${selectedSatellite.id}.tle`} />
        </div>
      )}
    </section>
  );
}
