const express = require("express");
const router = express.Router();
const { getStandings } = require("../controllers/standingsController");

router.get("/", getStandings);

module.exports = router;
