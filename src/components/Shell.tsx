import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/listen", "Listen"],
  ["/events", "Events"],
  ["/satellites", "Satellites"],
  ["/map", "Map"],
  ["/signals", "Signals"],
  ["/collection", "Collection"],
  ["/equipment", "Equipment"],
  ["/learn", "Learn"],
];

export function Shell() {
  return (
    <div className="frame">
      <p className="banner">Under construction. The catalogue, passes, and this browser’s logbook work. Accounts and the rest of the station are not finished.</p>
      <header className="top">
        <p className="brand">DarksideRF</p>
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
