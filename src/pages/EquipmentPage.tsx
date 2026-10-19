import { Link } from "react-router-dom";
import { antennas, receivers } from "../data/equipment";
import { formatFrequency } from "../lib/format";

export function EquipmentPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Equipment</p>
      <h1>Receivers and antennas</h1>
      <p className="lede">Published tuning ranges. A range is not a promise that a weak satellite will be readable.</p>
      <p><Link to="/my-equipment">Edit your station</Link></p>
      <h2>Receivers</h2>
      <ul className="directory">
        {receivers.map((receiver) => (
          <li key={receiver.id}>
            <div>
              <p className="spec-line">
                <strong>{receiver.name}</strong>
                <span>{receiver.bands.map((band) => `${formatFrequency(band.minHz)} – ${formatFrequency(band.maxHz)}`).join(", ")} · {receiver.bits}</span>
              </p>
              <span>{receiver.notes}</span>
              <a href={receiver.source}>Published specification</a>
            </div>
          </li>
        ))}
      </ul>
      <h2>Antennas</h2>
      <ul className="directory">
        {antennas.map((antenna) => (
          <li key={antenna.id}>
            <div>
              <p className="spec-line">
                <Link to={`/antennas/${antenna.id}`}><strong>{antenna.name}</strong></Link>
                <span>{antenna.polarisation} · {antenna.directionality}</span>
              </p>
              <span>{antenna.notes}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
