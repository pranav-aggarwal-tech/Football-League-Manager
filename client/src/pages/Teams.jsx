import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import TeamBadge from "../components/TeamBadge.jsx";

const emptyForm = { name: "", shortName: "", city: "", coach: "", foundedYear: "", crestColor: "#FFC94D" };

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      setError("Couldn't load teams. Is the API server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.foundedYear) delete payload.foundedYear;
      if (!payload.shortName) delete payload.shortName;
      await api.post("https://football-league-manager-k1rq.onrender.com/teams", payload);
      setForm(emptyForm);
      setShowForm(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete ${name}? This also removes its players.`)) return;
    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete team");
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mist mb-1">Registry</p>
          <h2 className="font-display text-4xl text-chalk">Teams</h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors"
        >
          {showForm ? "Cancel" : "+ New Team"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="scoreboard-panel p-6 mb-8 grid grid-cols-2 gap-4">
          <Field label="Team Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Short Name (3-4 letters)" value={form.shortName} onChange={(v) => setForm({ ...form, shortName: v.toUpperCase().slice(0, 4) })} />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Coach" value={form.coach} onChange={(v) => setForm({ ...form, coach: v })} />
          <Field label="Founded Year" type="number" value={form.foundedYear} onChange={(v) => setForm({ ...form, foundedYear: v })} />
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-mist mb-2">Crest Color</label>
            <input
              type="color"
              value={form.crestColor}
              onChange={(e) => setForm({ ...form, crestColor: e.target.value })}
              className="w-full h-10 bg-transparent border border-turfLight rounded-sm cursor-pointer"
            />
          </div>
          {error && <p className="col-span-2 text-crimson font-mono text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 font-mono text-xs uppercase tracking-widest px-4 py-3 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Team"}
          </button>
        </form>
      )}

      {loading && <p className="font-mono text-mist">Loading teams…</p>}

      {!loading && teams.length === 0 && !showForm && (
        <div className="scoreboard-panel px-6 py-10 text-center">
          <p className="text-mist font-mono">No teams registered yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team._id} className="scoreboard-panel p-5 hover:border-amber/50 transition-colors group">
            <Link to={`/teams/${team._id}`} className="flex items-center gap-3 mb-3">
              <TeamBadge shortName={team.shortName} color={team.crestColor} size={36} />
              <div>
                <h3 className="font-semibold text-chalk group-hover:text-amber transition-colors">{team.name}</h3>
                <p className="font-mono text-xs text-mist">{team.city || "—"}</p>
              </div>
            </Link>
            <div className="font-mono text-xs text-mist space-y-1 mb-3">
              <p>Coach: {team.coach || "—"}</p>
              <p>Founded: {team.foundedYear || "—"}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/teams/${team._id}`}
                className="flex-1 text-center font-mono text-[11px] uppercase tracking-widest px-3 py-2 border border-turfLight rounded-sm text-mist hover:text-chalk hover:border-amber transition-colors"
              >
                View
              </Link>
              <button
                onClick={() => handleDelete(team._id, team.name)}
                className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 border border-turfLight rounded-sm text-crimson hover:border-crimson transition-colors"
              >
                Delete
              </button>
            </div>
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
