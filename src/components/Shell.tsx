import { Link, NavLink, Outlet } from "react-router-dom";
import { useAccount } from "../hooks/useAccount";

const links = [
  ["/listen", "Listen"],
  ["/events", "Events"],
  ["/hunt", "Hunt"],
  ["/satellites", "Satellites"],
  ["/map", "Map"],
  ["/signals", "Signals"],
  ["/collection", "Collection"],
  ["/equipment", "Equipment"],
  ["/learn", "Learn"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/account", "Account"],
];

export function Shell() {
  const { configured, email } = useAccount();
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
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
