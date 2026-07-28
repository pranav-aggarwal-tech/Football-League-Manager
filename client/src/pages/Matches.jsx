import { useEffect, useState } from "react";
import api from "../api/axios.js";
import TeamBadge from "../components/TeamBadge.jsx";

const emptyMatch = { homeTeam: "", awayTeam: "", matchDate: "", venue: "", round: "" };

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMatch);
  const [error, setError] = useState("");
  const [recordingId, setRecordingId] = useState(null);

  useEffect(() => {
    api.get("/teams").then((res) => setTeams(res.data));
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/matches", { params });
      setMatches(res.data);
    } catch (err) {
      // keep previous list on transient errors
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("https://football-league-manager-k1rq.onrender.com/api/matches", form);
      setForm(emptyMatch);
      setShowForm(false);
      fetchMatches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule match");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this match? This will also recalculate player stats.")) return;
    try {
      await api.delete(`/matches/${id}`);
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete match");
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mist mb-1">Fixtures</p>
          <h2 className="font-display text-4xl text-chalk">Matches</h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors"
        >
          {showForm ? "Cancel" : "+ Schedule Match"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSchedule} className="scoreboard-panel p-6 mb-8 grid grid-cols-2 gap-4">
          <SelectField label="Home Team *" required value={form.homeTeam} onChange={(v) => setForm({ ...form, homeTeam: v })} options={teams} />
          <SelectField label="Away Team *" required value={form.awayTeam} onChange={(v) => setForm({ ...form, awayTeam: v })} options={teams} />
          <Field label="Match Date *" type="datetime-local" required value={form.matchDate} onChange={(v) => setForm({ ...form, matchDate: v })} />
          <Field label="Venue" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
          <Field label="Round / Matchday" value={form.round} onChange={(v) => setForm({ ...form, round: v })} />
          {error && <p className="col-span-2 text-crimson font-mono text-sm">{error}</p>}
          <button
            type="submit"
            className="col-span-2 font-mono text-xs uppercase tracking-widest px-4 py-3 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors"
          >
            Schedule Match
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-6">
        {[
          { value: "", label: "All" },
          { value: "scheduled", label: "Scheduled" },
          { value: "played", label: "Played" },
          { value: "postponed", label: "Postponed" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-2 rounded-sm border transition-colors ${
              statusFilter === opt.value
                ? "bg-amber text-night border-amber font-bold"
                : "border-turfLight text-mist hover:text-chalk"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <p className="font-mono text-mist">Loading matches…</p>}

      {!loading && matches.length === 0 && (
        <div className="scoreboard-panel px-6 py-10 text-center">
          <p className="text-mist font-mono">No matches found for this filter.</p>
        </div>
      )}

      <div className="space-y-3">
        {matches.map((m) => (
          <MatchRow
            key={m._id}
            match={m}
            isRecording={recordingId === m._id}
            onToggleRecord={() => setRecordingId(recordingId === m._id ? null : m._id)}
            onRecorded={() => {
              setRecordingId(null);
              fetchMatches();
            }}
            onDelete={() => handleDelete(m._id)}
          />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, isRecording, onToggleRecord, onRecorded, onDelete }) {
  return (
    <div className="scoreboard-panel">
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="font-mono text-xs text-mist w-36 shrink-0">
          {new Date(match.matchDate).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="flex-1 flex items-center justify-center gap-4">
          <span className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold text-sm">{match.homeTeam?.name}</span>
            <TeamBadge shortName={match.homeTeam?.shortName} color={match.homeTeam?.crestColor} size={26} />
          </span>
          {match.status === "played" ? (
            <span className="led-number text-amber font-bold text-xl px-3">{match.homeScore} — {match.awayScore}</span>
          ) : (
            <span className="font-mono text-xs text-mist uppercase px-3">vs</span>
          )}
          <span className="flex items-center gap-2 flex-1">
            <TeamBadge shortName={match.awayTeam?.shortName} color={match.awayTeam?.crestColor} size={26} />
            <span className="font-semibold text-sm">{match.awayTeam?.name}</span>
          </span>
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm shrink-0 ${
            match.status === "played" ? "bg-amber/20 text-amber" : match.status === "postponed" ? "bg-crimson/20 text-crimson" : "bg-mist/20 text-mist"
          }`}
        >
          {match.status}
        </span>
        <div className="flex gap-2 shrink-0">
          {match.status !== "played" && (
            <button
              onClick={onToggleRecord}
              className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 border border-turfLight rounded-sm text-amber hover:border-amber transition-colors"
            >
              {isRecording ? "Cancel" : "Record Result"}
            </button>
          )}
          {match.status === "played" && (
            <button
              onClick={onToggleRecord}
              className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 border border-turfLight rounded-sm text-mist hover:text-chalk transition-colors"
            >
              {isRecording ? "Cancel" : "Edit Score"}
            </button>
          )}
          <button
            onClick={onDelete}
            className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 border border-turfLight rounded-sm text-crimson hover:border-crimson transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {isRecording && <ResultForm match={match} onDone={onRecorded} />}
    </div>
  );
}

function ResultForm({ match, onDone }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [homeScorers, setHomeScorers] = useState([]);
  const [awayScorers, setAwayScorers] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/players", { params: { team: match.homeTeam._id } }).then((res) => setHomePlayers(res.data));
    api.get("/players", { params: { team: match.awayTeam._id } }).then((res) => setAwayPlayers(res.data));
  }, [match]);

  function updateScorerCount(side, count) {
    const setter = side === "home" ? setHomeScorers : setAwayScorers;
    const current = side === "home" ? homeScorers : awayScorers;
    const next = Array.from({ length: count }, (_, i) => current[i] || { player: "", minute: "" });
    setter(next);
  }

  useEffect(() => { updateScorerCount("home", Number(homeScore) || 0); }, [homeScore]);
  useEffect(() => { updateScorerCount("away", Number(awayScore) || 0); }, [awayScore]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const cleanScorers = (list) =>
        list.filter((s) => s.player).map((s) => ({ player: s.player, minute: s.minute ? Number(s.minute) : undefined }));
      await api.patch(`/matches/${match._id}/result`, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        homeScorers: cleanScorers(homeScorers),
        awayScorers: cleanScorers(awayScorers),
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record result");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-turfLight px-5 py-5 bg-night/40">
      <div className="grid grid-cols-2 gap-8">
        <ScorerColumn
          teamName={match.homeTeam.name}
          score={homeScore}
          onScoreChange={setHomeScore}
          players={homePlayers}
          scorers={homeScorers}
          setScorers={setHomeScorers}
        />
        <ScorerColumn
          teamName={match.awayTeam.name}
          score={awayScore}
          onScoreChange={setAwayScore}
          players={awayPlayers}
          scorers={awayScorers}
          setScorers={setAwayScorers}
        />
      </div>
      {error && <p className="text-crimson font-mono text-sm mt-4">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 font-mono text-xs uppercase tracking-widest px-5 py-3 bg-amber text-night font-bold rounded-sm hover:bg-chalk transition-colors disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save Final Result"}
      </button>
    </form>
  );
}

function ScorerColumn({ teamName, score, onScoreChange, players, scorers, setScorers }) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-mist mb-2">{teamName} Score</label>
      <input
        type="number"
        min="0"
        value={score}
        onChange={(e) => onScoreChange(e.target.value)}
        className="w-24 bg-night border border-turfLight rounded-sm px-3 py-2 text-chalk font-mono text-lg focus:border-amber outline-none mb-3"
      />
      {scorers.length > 0 && (
        <div className="space-y-2">
          {scorers.map((s, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={s.player}
                onChange={(e) => {
                  const next = [...scorers];
                  next[i] = { ...next[i], player: e.target.value };
                  setScorers(next);
                }}
                className="flex-1 bg-night border border-turfLight rounded-sm px-2 py-1.5 font-mono text-xs text-chalk focus:border-amber outline-none"
              >
                <option value="">Goal scorer…</option>
                {players.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="min"
                min="1"
                max="130"
                value={s.minute}
                onChange={(e) => {
                  const next = [...scorers];
                  next[i] = { ...next[i], minute: e.target.value };
                  setScorers(next);
                }}
                className="w-16 bg-night border border-turfLight rounded-sm px-2 py-1.5 font-mono text-xs text-chalk focus:border-amber outline-none"
              />
            </div>
          ))}
        </div>
      )}
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

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-mist mb-2">{label}</label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-night border border-turfLight rounded-sm px-3 py-2 text-chalk focus:border-amber outline-none"
      >
        <option value="">Select team…</option>
        {options.map((t) => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
