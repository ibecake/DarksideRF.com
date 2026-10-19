import { Link, useParams } from "react-router-dom";
import { antennaById, antennas } from "../data/equipment";

export function AntennaPage() {
  const { id = "" } = useParams();
  const antenna = antennaById(id);
  if (!antenna) {
    return (
      <section className="panel">
        <h1>Unknown antenna</h1>
        <Link to="/equipment">Back to equipment</Link>
      </section>
    );
  }
  const others = antennas.filter((item) => item.id !== antenna.id && item.id !== "vhf-uhf-whip");
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Build</p>
      <h1>{antenna.name}</h1>
      <p className="lede">{antenna.buildSummary}</p>
      <p className="muted">{antenna.notes}</p>
      <ol className="build-steps">
        {antenna.buildSteps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <h2>Other simple antennas</h2>
      <ul className="directory">
        {others.map((item) => (
          <li key={item.id}>
            <Link to={`/antennas/${item.id}`}>
              <strong>{item.name}</strong>
              <span>{item.notes}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
