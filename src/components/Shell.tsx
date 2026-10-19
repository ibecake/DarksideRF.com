import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/listen", "Listen"],
  ["/events", "Events"],
  ["/satellites", "Satellites"],
  ["/signals", "Signals"],
  ["/collection", "Collection"],
  ["/equipment", "Equipment"],
  ["/learn", "Learn"],
];

export function Shell() {
  return (
    <div className="frame">
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
