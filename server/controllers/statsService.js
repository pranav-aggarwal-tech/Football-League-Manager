const Player = require("../models/Player");
const Match = require("../models/Match");

/**
 * Recomputes goals and appearances for every player from scratch, based on
 * played matches' scorer lists. This is intentionally a full recalculation
 * (rather than incremental +1/-1 updates) so stats can never drift out of
 * sync if a match score is edited or deleted later.
 */
async function recalculateAllPlayerStats() {
  const players = await Player.find();
  const playedMatches = await Match.find({ status: "played" });

  const goalTally = {};
  const appearanceSet = {}; // playerId -> Set of matchIds they're known to have appeared in (scorers only, since we don't track full lineups)

  for (const match of playedMatches) {
    for (const scorer of [...match.homeScorers, ...match.awayScorers]) {
      const pid = String(scorer.player);
      goalTally[pid] = (goalTally[pid] || 0) + 1;
      if (!appearanceSet[pid]) appearanceSet[pid] = new Set();
      appearanceSet[pid].add(String(match._id));
    }
  }

  const bulkOps = players.map((player) => {
    const pid = String(player._id);
    const goals = goalTally[pid] || 0;
    // Appearances derived from goal-scoring matches is a floor, not exact,
    // since we don't track full matchday squads. We keep whichever is larger
    // so manually-entered appearance counts aren't clobbered downward.
    const derivedAppearances = appearanceSet[pid] ? appearanceSet[pid].size : 0;
    const appearances = Math.max(player.appearances || 0, derivedAppearances);
    return {
      updateOne: {
        filter: { _id: player._id },
        update: { $set: { goals, appearances } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Player.bulkWrite(bulkOps);
  }
}

module.exports = { recalculateAllPlayerStats };
