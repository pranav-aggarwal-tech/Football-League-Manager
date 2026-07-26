import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Standings", end: true },
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/matches", label: "Matches" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-turfLight bg-night/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber animate-pulse" aria-hidden="true" />
          <h1 className="font-display text-2xl tracking-wide text-chalk">
            MATCHDAY <span className="text-amber">//</span> LEAGUE MANAGER
          </h1>
        </div>
        <nav className="flex gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-sm transition-colors ${
                  isActive
                    ? "bg-amber text-night font-bold"
                    : "text-mist hover:text-chalk hover:bg-turfLight"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
