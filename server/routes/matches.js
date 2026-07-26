const express = require("express");
const router = express.Router();
const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  recordResult,
  deleteMatch,
} = require("../controllers/matchController");

router.route("/").post(createMatch).get(getMatches);
router.route("/:id").get(getMatchById).put(updateMatch).delete(deleteMatch);
router.patch("/:id/result", recordResult);

module.exports = router;
