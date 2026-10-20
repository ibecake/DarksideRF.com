import { Link } from "react-router-dom";
import { satelliteById } from "../data/catalogue";
import { useLogbook } from "../hooks/useStore";
import { collectionSets } from "../lib/collection";

export function SetsPage() {
  const { store } = useLogbook();
  const received = new Set(store.logs.map((log) => log.satelliteId));
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Sets</p>
      <h1>Themed collections</h1>
      <p className="lede">Progress counts satellites you have logged, not passes the predictor drew.</p>
      {collectionSets.map((set) => {
        const done = set.satelliteIds.filter((id) => received.has(id)).length;
        return (
          <article key={set.slug} className="pass">
            <div className="pass-top">
              <h2>{set.name}</h2>
              <span className="pill received">{done} / {set.satelliteIds.length}</span>
            </div>
            <p>{set.description}</p>
            {set.slug === "zombies" && <p><Link to="/hunt">Open Zombie Hunter</Link></p>}
            <ul>
              {set.satelliteIds.map((id) => (
                <li key={id}>
                  <Link to={`/satellite/${id}`}>{satelliteById(id)?.name ?? id}</Link>
                  {received.has(id) ? " — collected" : " — not collected"}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
