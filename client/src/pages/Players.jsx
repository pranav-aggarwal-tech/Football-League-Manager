import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import TeamBadge from "../components/TeamBadge.jsx";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teams").then((res) => setTeams(res.data));
    api.get("/players/top-scorers?limit=5").then((res) => setTopScorers(res.data));
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [teamFilter, positionFilter]);

  async function fetchPlayers() {
    setLoading(true);
    try {
      const params = {};
      if (teamFilter) params.team = teamFilter;
      if (positionFilter) params.position = positionFilter;
      const res = await api.get("/players", { params });
      setPlayers(res.data);
    } catch (err) {
      // silently keep previous list
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-mist mb-1">League-Wide</p>
      <h2 className="font-display text-4xl text-chalk mb-6">Players</h2>

      {topScorers.length > 0 && (
        <div className="scoreboard-panel p-5 mb-8">
          <h3 className="font-mono text-xs uppercase tracking-widest text-mist mb-4">Top Scorers</h3>
          <div className="flex flex-wrap gap-6">
            {topScorers.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="font-display text-2xl text-amber">{i + 1}</span>
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="font-mono text-xs text-mist">{p.team?.name}</p>
                </div>
                <span className="led-number text-xl text-amber font-bold ml-1">{p.goals}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-night border border-turfLight rounded-sm px-3 py-2 font-mono text-xs text-chalk focus:border-amber outline-none"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="bg-night border border-turfLight rounded-sm px-3 py-2 font-mono text-xs text-chalk focus:border-amber outline-none"
        >
          <option value="">All Positions</option>
          {["Goalkeeper", "Defender", "Midfielder", "Forward"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading && <p className="font-mono text-mist">Loading players…</p>}

      {!loading && (
        <div className="scoreboard-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-mist border-b border-turfLight">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-3 py-3 text-center">G</th>
                <th className="px-3 py-3 text-center">A</th>
                <th className="px-3 py-3 text-center">Apps</th>
                <th className="px-3 py-3 text-center">YC</th>
                <th className="px-3 py-3 text-center">RC</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-mist font-mono">No players match this filter.</td>
                </tr>
              )}
              {players.map((p) => (
                <tr key={p._id} className="border-b border-turfLight/60 last:border-0 hover:bg-turfLight/50">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.team && (
                      <Link to={`/teams/${p.team._id}`} className="flex items-center gap-2 hover:text-amber">
                        <TeamBadge shortName={p.team.shortName} color={p.team.crestColor} size={22} />
                        <span className="font-mono text-xs">{p.team.name}</span>
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-mist">{p.position}</td>
                  <td className="px-3 py-3 text-center led-number text-amber font-bold">{p.goals}</td>
                  <td className="px-3 py-3 text-center led-number">{p.assists}</td>
                  <td className="px-3 py-3 text-center led-number text-mist">{p.appearances}</td>
                  <td className="px-3 py-3 text-center led-number text-mist">{p.yellowCards}</td>
                  <td className="px-3 py-3 text-center led-number text-crimson">{p.redCards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
