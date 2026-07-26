const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

router.route("/").post(createTeam).get(getTeams);
router.route("/:id").get(getTeamById).put(updateTeam).delete(deleteTeam);

module.exports = router;
