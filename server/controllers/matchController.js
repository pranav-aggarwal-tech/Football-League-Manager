const Match = require("../models/Match");
const Team = require("../models/Team");
const { recalculateAllPlayerStats } = require("./statsService");

// @desc  Schedule a new match
// @route POST /api/matches
exports.createMatch = async (req, res) => {
  try {
    const { homeTeam, awayTeam } = req.body;
    if (String(homeTeam) === String(awayTeam)) {
      return res.status(400).json({ message: "Home and away team must be different" });
    }
    const [home, away] = await Promise.all([Team.findById(homeTeam), Team.findById(awayTeam)]);
    if (!home || !away) {
      return res.status(400).json({ message: "Both teams must exist" });
    }

    const match = await Match.create(req.body);
    const populated = await match.populate("homeTeam awayTeam", "name shortName crestColor");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Get all matches (optionally filter by status or team)
// @route GET /api/matches?status=played&team=<id>
exports.getMatches = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.team) {
      filter.$or = [{ homeTeam: req.query.team }, { awayTeam: req.query.team }];
    }

    const matches = await Match.find(filter)
      .populate("homeTeam awayTeam", "name shortName crestColor")
      .populate("homeScorers.player awayScorers.player", "name")
      .sort({ matchDate: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get a single match
// @route GET /api/matches/:id
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("homeTeam awayTeam", "name shortName crestColor")
      .populate("homeScorers.player awayScorers.player", "name position");
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update match details (schedule info, or record/edit the score)
// @route PUT /api/matches/:id
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("homeTeam awayTeam", "name shortName crestColor");
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Keep player goal/appearance stats in sync whenever a result changes
    if (req.body.status === "played" || req.body.homeScorers || req.body.awayScorers) {
      await recalculateAllPlayerStats();
    }

    res.json(match);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Record/update the final score of a match in one dedicated action
// @route PATCH /api/matches/:id/result
exports.recordResult = async (req, res) => {
  try {
    const { homeScore, awayScore, homeScorers, awayScorers } = req.body;
    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ message: "homeScore and awayScore are required" });
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      {
        homeScore,
        awayScore,
        homeScorers: homeScorers || [],
        awayScorers: awayScorers || [],
        status: "played",
      },
      { new: true, runValidators: true }
    ).populate("homeTeam awayTeam", "name shortName crestColor");

    if (!match) return res.status(404).json({ message: "Match not found" });

    await recalculateAllPlayerStats();
    res.json(match);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete a match
// @route DELETE /api/matches/:id
exports.deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    await recalculateAllPlayerStats();
    res.json({ message: "Match deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
