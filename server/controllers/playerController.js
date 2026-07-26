const Player = require("../models/Player");
const Team = require("../models/Team");

// @desc  Create a player
// @route POST /api/players
exports.createPlayer = async (req, res) => {
  try {
    const team = await Team.findById(req.body.team);
    if (!team) return res.status(400).json({ message: "Assigned team does not exist" });

    const player = await Player.create(req.body);
    const populated = await player.populate("team", "name shortName");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That jersey number is already taken on this team" });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc  Get all players (optionally filter by team or position)
// @route GET /api/players?team=<id>&position=<pos>
exports.getPlayers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;
    if (req.query.position) filter.position = req.query.position;

    const players = await Player.find(filter)
      .populate("team", "name shortName crestColor")
      .sort({ goals: -1, name: 1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get top scorers across the league
// @route GET /api/players/top-scorers
exports.getTopScorers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const players = await Player.find({ goals: { $gt: 0 } })
      .populate("team", "name shortName crestColor")
      .sort({ goals: -1, assists: -1 })
      .limit(limit);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get a single player
// @route GET /api/players/:id
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate("team", "name shortName crestColor");
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update a player
// @route PUT /api/players/:id
exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("team", "name shortName crestColor");
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete a player
// @route DELETE /api/players/:id
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json({ message: "Player deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
