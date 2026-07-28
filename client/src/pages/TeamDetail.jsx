import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import TeamBadge from "../components/TeamBadge.jsx";

const emptyPlayer = { name: "", position: "Midfielder", jerseyNumber: "", age: "", nationality: "" };

export default function TeamDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPlayer);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchTeam();
  }, [id]);

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await api.get(`/teams/${id}`);
      setData(res.data);
    } catch (err) {
      setError("Couldn't load team details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPlayer(e) {
    e.preventDefault();
    setFormError("");
    try {
      const payload = { ...form, team: id };
      if (!payload.jerseyNumber) delete payload.jerseyNumber;
      if (!payload.age) delete payload.age;
      await api.post("https://football-league-manager-k1rq.onrender.com/players", payload);
      setForm(emptyPlayer);
      setShowForm(false);
      fetchTeam();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add player");
    }
  }

  async function handleDeletePlayer(playerId, name) {
    if (!window.confirm(`Remove ${name} from the roster?`)) return;
    try {
      await api.delete(`/players/${playerId}`);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete player");
    }
  }

  if (loading) return <p className="font-mono text-mist">Loading team…</p>;
  if (error) return <p className="font-mono text-crimson">{error}</p>;
  if (!data) return null;

  const { team, players, matches } = data;

  return (
    <div>
      <Link to="/teams" className="font-mono text-xs text-mist hover:text-amber uppercase tracking-widest">
        ← Back to Teams
      </Link>

      <div className="scoreboard-panel p-6 my-6 flex items-center gap-5">
        <TeamBadge shortName={team.shortName} color={team.crestColor} size={64} />
        <div>
          <h2 className="font-display text-4xl text-chalk">{team.name}</h2>
          <p className="font-mono text-sm text-mist mt-1">
            {team.city || "Unknown city"} · Coach {team.coach || "TBD"} · Est. {team.foundedYear || "—"}
          </p>
        </div>
      </div>

      {/* Roster */}
      <div className="flex items-end justify-between mb-4">
        <h3 className="font-display text-2xl text-chalk">Roster ({players.length})</h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPlayer} className="scoreboard-panel p-6 mb-6 grid grid-cols-2 gap-4">
          <Field label="Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-mist mb-2">Position</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full bg-night border border-turfLight rounded-sm px-3 py-2 text-chalk focus:border-amber outline-none"
            >
              {["Goalkeeper", "Defender", "Midfielder", "Forward"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <Field label="Jersey Number" type="number" value={form.jerseyNumber} onChange={(v) => setForm({ ...form, jerseyNumber: v })} />
          <Field label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
          <Field label="Nationality" value={form.nationality} onChange={(v) => setForm({ ...form, nationality: v })} />
          {formError && <p className="col-span-2 text-crimson font-mono text-sm">{formError}</p>}
          <button
            type="submit"
            className="col-span-2 font-mono text-xs uppercase tracking-widest px-4 py-3 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors"
          >
            Add to Roster
          </button>
        </form>
      )}

      <div className="scoreboard-panel overflow-x-auto mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[11px] uppercase tracking-widest text-mist border-b border-turfLight">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-3 py-3 text-center">Age</th>
              <th className="px-3 py-3 text-center">Nat.</th>
              <th className="px-3 py-3 text-center">G</th>
              <th className="px-3 py-3 text-center">A</th>
              <th className="px-3 py-3 text-center">Apps</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-mist font-mono">No players yet.</td>
              </tr>
            )}
            {players.map((p) => (
              <tr key={p._id} className="border-b border-turfLight/60 last:border-0 hover:bg-turfLight/50">
                <td className="px-4 py-3 led-number text-mist">{p.jerseyNumber ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-mist">{p.position}</td>
                <td className="px-3 py-3 text-center led-number">{p.age ?? "—"}</td>
                <td className="px-3 py-3 text-center font-mono text-xs">{p.nationality || "—"}</td>
                <td className="px-3 py-3 text-center led-number text-amber font-bold">{p.goals}</td>
                <td className="px-3 py-3 text-center led-number">{p.assists}</td>
                <td className="px-3 py-3 text-center led-number text-mist">{p.appearances}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeletePlayer(p._id, p.name)}
                    className="font-mono text-[11px] text-crimson hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Match history */}
      <h3 className="font-display text-2xl text-chalk mb-4">Match History</h3>
      <div className="scoreboard-panel divide-y divide-turfLight/60">
        {matches.length === 0 && <p className="px-4 py-6 text-center text-mist font-mono">No matches scheduled yet.</p>}
        {matches.map((m) => (
          <div key={m._id} className="px-5 py-4 flex items-center justify-between">
            <div className="font-mono text-xs text-mist w-28 shrink-0">
              {new Date(m.matchDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="flex-1 flex items-center justify-center gap-4">
              <span className={m.homeTeam._id === team._id ? "font-bold text-chalk" : "text-mist"}>{m.homeTeam.shortName}</span>
              {m.status === "played" ? (
                <span className="led-number text-amber font-bold text-lg">{m.homeScore} — {m.awayScore}</span>
              ) : (
                <span className="font-mono text-xs text-mist uppercase px-2 py-1 border border-turfLight rounded-sm">{m.status}</span>
              )}
              <span className={m.awayTeam._id === team._id ? "font-bold text-chalk" : "text-mist"}>{m.awayTeam.shortName}</span>
            </div>
            <div className="w-24 shrink-0 text-right font-mono text-[11px] text-mist uppercase">{m.round || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-mist mb-2">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-night border border-turfLight rounded-sm px-3 py-2 text-chalk focus:border-amber outline-none"
      />
    </div>
  );
}
