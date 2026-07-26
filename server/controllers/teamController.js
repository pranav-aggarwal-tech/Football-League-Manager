const Team = require("../models/Team");
const Player = require("../models/Player");
const Match = require("../models/Match");

// @desc  Create a new team
// @route POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A team with this name already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc  Get all teams
// @route GET /api/teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get a single team with its players and recent matches
// @route GET /api/teams/:id
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const players = await Player.find({ team: team._id }).sort({ jerseyNumber: 1 });
    const matches = await Match.find({
      $or: [{ homeTeam: team._id }, { awayTeam: team._id }],
    })
      .populate("homeTeam awayTeam", "name shortName")
      .sort({ matchDate: -1 });

    res.json({ team, players, matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update a team
// @route PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete a team (and cascade its players; blocks if matches exist)
// @route DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const matchCount = await Match.countDocuments({
      $or: [{ homeTeam: team._id }, { awayTeam: team._id }],
    });
    if (matchCount > 0) {
      return res.status(400).json({
        message: `Cannot delete team: ${matchCount} match(es) reference this team. Delete those matches first.`,
      });
    }

    await Player.deleteMany({ team: team._id });
    await team.deleteOne();
    res.json({ message: "Team and its players deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
