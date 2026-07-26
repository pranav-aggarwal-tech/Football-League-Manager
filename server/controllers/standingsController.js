const Team = require("../models/Team");
const Match = require("../models/Match");

// @desc  Compute and return the league standings table from played matches
// @route GET /api/standings
exports.getStandings = async (req, res) => {
  try {
    const teams = await Team.find();
    const playedMatches = await Match.find({ status: "played" });

    // Initialize a stats row for every team, including teams with 0 games played
    const table = {};
    teams.forEach((team) => {
      table[team._id] = {
        team: {
          _id: team._id,
          name: team.name,
          shortName: team.shortName,
          crestColor: team.crestColor,
        },
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: [], // last results in chronological order, e.g. ['W','D','L']
      };
    });

    // Sort matches chronologically so "form" reflects real order of play
    const sortedMatches = [...playedMatches].sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

    for (const match of sortedMatches) {
      const homeId = String(match.homeTeam);
      const awayId = String(match.awayTeam);
      const homeRow = table[homeId];
      const awayRow = table[awayId];

      // Skip matches referencing a team that no longer exists
      if (!homeRow || !awayRow || match.homeScore === null || match.awayScore === null) continue;

      homeRow.played += 1;
      awayRow.played += 1;
      homeRow.goalsFor += match.homeScore;
      homeRow.goalsAgainst += match.awayScore;
      awayRow.goalsFor += match.awayScore;
      awayRow.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        homeRow.won += 1;
        homeRow.points += 3;
        homeRow.form.push("W");
        awayRow.lost += 1;
        awayRow.form.push("L");
      } else if (match.homeScore < match.awayScore) {
        awayRow.won += 1;
        awayRow.points += 3;
        awayRow.form.push("W");
        homeRow.lost += 1;
        homeRow.form.push("L");
      } else {
        homeRow.drawn += 1;
        homeRow.points += 1;
        homeRow.form.push("D");
        awayRow.drawn += 1;
        awayRow.points += 1;
        awayRow.form.push("D");
      }
    }

    const standings = Object.values(table).map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      form: row.form.slice(-5), // most recent 5 results
    }));

    // Standard football sort: points, then goal difference, then goals scored, then alphabetical
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

    // Attach rank after sorting
    const ranked = standings.map((row, index) => ({ position: index + 1, ...row }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
