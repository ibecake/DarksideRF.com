import { Link } from "react-router-dom";
import { antennas, receivers } from "../data/equipment";
import { formatFrequency } from "../lib/format";

const handheld = receivers.filter((receiver) => receiver.family === "Handheld");
const sdr = receivers.filter((receiver) => receiver.family !== "Handheld");

export function EquipmentPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Equipment</p>
      <h1>Receivers and antennas</h1>
      <p className="lede">
        Published tuning ranges for a few common SDR dongles and one handheld class. A range is not a promise that a weak satellite will be readable. This is not a catalogue of every radio on the market — pick the closest match for your station.
      </p>
      <p><Link to="/my-equipment">Edit your station</Link></p>
      <h2>SDR receivers</h2>
      <ul className="directory">
        {sdr.map((receiver) => (
          <ReceiverRow key={receiver.id} receiver={receiver} />
        ))}
      </ul>
      <h2>Handheld radios</h2>
      <p className="muted">
        One dual-band FM class stands in for Baofeng UV-9R / UV-5R and similar HTs. If you heard the ISS repeater on a handheld with a Yagi, select this and the handheld Yagi on your station page.
      </p>
      <ul className="directory">
        {handheld.map((receiver) => (
          <ReceiverRow key={receiver.id} receiver={receiver} />
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

function ReceiverRow({ receiver }: { receiver: (typeof receivers)[number] }) {
  return (
    <li>
      <div>
        <p className="spec-line">
          <strong>{receiver.name}</strong>
          <span>{receiver.bands.map((band) => `${formatFrequency(band.minHz)} – ${formatFrequency(band.maxHz)}`).join(", ")} · {receiver.bits}</span>
        </p>
        <span>{receiver.notes}</span>
        <a href={receiver.source}>Published specification</a>
      </div>
    </li>
  );
}
