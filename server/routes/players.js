const express = require("express");
const router = express.Router();
const {
  createPlayer,
  getPlayers,
  getTopScorers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} = require("../controllers/playerController");

router.route("/").post(createPlayer).get(getPlayers);
router.get("/top-scorers", getTopScorers);
router.route("/:id").get(getPlayerById).put(updatePlayer).delete(deletePlayer);

module.exports = router;
