import { useEffect, useState } from "react";
import api from "../api/axios.js";
import TeamBadge from "../components/TeamBadge.jsx";
import { Link } from "react-router-dom";

const formColor = { W: "bg-amber text-night", D: "bg-mist text-night", L: "bg-crimson text-chalk" };

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStandings();
  }, []);

  async function fetchStandings() {
    setLoading(true);
    try {
      const res = await api.get("/standings");
      setStandings(res.data);
      setError("");
    } catch (err) {
      setError("Couldn't load standings. Is the API server running?");
    } finally {
      setLoading(false);
    }
  }

  const zoneStripe = (position, total) => {
    if (position <= 1) return "border-l-4 border-l-amber";
    if (position >= total - 1 && total > 3) return "border-l-4 border-l-crimson";
    return "border-l-4 border-l-transparent";
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mist mb-1">Live Table</p>
          <h2 className="font-display text-4xl text-chalk">League Standings</h2>
        </div>
        <button
          onClick={fetchStandings}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-turfLight rounded-sm text-mist hover:text-chalk hover:border-amber transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="font-mono text-mist">Loading standings…</p>}
      {error && (
        <p className="font-mono text-crimson bg-crimson/10 border border-crimson/30 rounded-sm px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && standings.length === 0 && (
        <div className="scoreboard-panel px-6 py-10 text-center">
          <p className="text-mist font-mono">No teams yet. Add teams and play some matches to populate the table.</p>
          <Link to="/teams" className="inline-block mt-4 text-amber font-mono text-xs uppercase tracking-widest underline">
            Go create a team →
          </Link>
        </div>
      )}

      {!loading && standings.length > 0 && (
        <div className="scoreboard-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-mist border-b border-turfLight">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">W</th>
                <th className="px-3 py-3 text-center">D</th>
                <th className="px-3 py-3 text-center">L</th>
                <th className="px-3 py-3 text-center">GF</th>
                <th className="px-3 py-3 text-center">GA</th>
                <th className="px-3 py-3 text-center">GD</th>
                <th className="px-3 py-3 text-center">Pts</th>
                <th className="px-4 py-3">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr
                  key={row.team._id}
                  className={`border-b border-turfLight/60 last:border-0 hover:bg-turfLight/50 transition-colors ${zoneStripe(row.position, standings.length)}`}
                >
                  <td className="px-4 py-3 font-display text-lg text-mist">{row.position}</td>
                  <td className="px-4 py-3">
                    <Link to={`/teams/${row.team._id}`} className="flex items-center gap-3 hover:text-amber transition-colors">
                      <TeamBadge shortName={row.team.shortName} color={row.team.crestColor} size={28} />
                      <span className="font-semibold">{row.team.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center led-number">{row.played}</td>
                  <td className="px-3 py-3 text-center led-number">{row.won}</td>
                  <td className="px-3 py-3 text-center led-number">{row.drawn}</td>
                  <td className="px-3 py-3 text-center led-number">{row.lost}</td>
                  <td className="px-3 py-3 text-center led-number text-mist">{row.goalsFor}</td>
                  <td className="px-3 py-3 text-center led-number text-mist">{row.goalsAgainst}</td>
                  <td className="px-3 py-3 text-center led-number">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-3 py-3 text-center led-number text-amber font-bold text-base">{row.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {row.form.length === 0 && <span className="text-mist font-mono text-xs">—</span>}
                      {row.form.map((result, i) => (
                        <span
                          key={i}
                          className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold font-mono ${formColor[result]}`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-6 px-4 py-3 border-t border-turfLight font-mono text-[11px] text-mist">
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-amber inline-block" /> Top of table
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-crimson inline-block" /> Relegation zone
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
