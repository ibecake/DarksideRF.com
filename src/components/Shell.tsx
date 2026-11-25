import { Link, NavLink, Outlet } from "react-router-dom";
import { useAccount } from "../hooks/useAccount";
import { useLogbook } from "../hooks/useStore";
import { achievementsFor } from "../lib/collection";
import { MissionBadgeStrip } from "./MissionBadge";

const ops = [
  ["/listen", "Listen"],
  ["/events", "Events"],
  ["/hunt", "Hunt"],
  ["/satellites", "Satellites"],
  ["/map", "Map"],
  ["/signals", "Signals"],
] as const;

const station = [
  ["/collection", "Collection"],
  ["/account", "Account"],
] as const;

const guide = [
  ["/equipment", "Equipment"],
  ["/learn", "Learn"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

function NavGroup({ label, links, highlight = false }: { label: string; links: readonly (readonly [string, string])[]; highlight?: boolean }) {
  return (
    <div className={`nav-group ${highlight ? "highlight" : ""}`}>
      <span className="nav-label">{label}</span>
      <div className="nav-links">
        {links.map(([to, name]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : undefined)}>
            {name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function Shell() {
  const { configured, email } = useAccount();
  const { store } = useLogbook();
  const achievements = achievementsFor(store.logs);
  const earned = achievements.filter((item) => item.earned).length;
  const banner = email
    ? `Signed in as ${email}. This browser keeps a copy of the logbook.`
    : configured
      ? "Listening works without an account. Sign in to keep this logbook on another device."
      : "Under construction. The catalogue, passes, and this browser’s logbook work. Sign-in needs a Supabase project before it can be used.";

  return (
    <div className="frame">
      <p className="banner">{banner}</p>
      <header className="top">
        <Link to="/listen" className="brand">
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="DarksideRF" width="132" height="132" />
        </Link>
        <nav aria-label="Primary">
          <NavGroup label="Ops" links={ops} />
          <NavGroup label="You" links={station} highlight />
          <NavGroup label="Guide" links={guide} />
        </nav>
      </header>
      <aside className="profile-rail" aria-label="Station and missions">
        <div className="profile-card">
          <p className="eyebrow">Station</p>
          <Link to="/my-equipment" className="profile-station">
            <strong>{store.profile.locationName}</strong>
            <span>
              {store.profile.receiverIds.length} receiver{store.profile.receiverIds.length === 1 ? "" : "s"} · {store.profile.antennaIds.length} antenna{store.profile.antennaIds.length === 1 ? "" : "s"} · min {store.profile.minElevation}°
            </span>
          </Link>
          <div className="profile-actions">
            <Link to="/collection">Logbook</Link>
            <Link to="/account">{email ? "Account" : "Sign in"}</Link>
            <Link to="/my-equipment">Edit station</Link>
          </div>
        </div>
        <Link to="/collection#missions" className="profile-missions">
          <MissionBadgeStrip achievements={achievements} compact />
          <span className="profile-missions-cta">{earned === 0 ? "Start your first mission" : "View mission badges"}</span>
        </Link>
      </aside>
      <Outlet />
    </div>
  );
}
