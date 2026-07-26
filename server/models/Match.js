const mongoose = require("mongoose");

const GoalScorerSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    minute: { type: Number, min: 1, max: 130 },
  },
  { _id: false }
);

const MatchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      validate: {
        validator: function (value) {
          return String(value) !== String(this.homeTeam);
        },
        message: "A team cannot play against itself",
      },
    },
    matchDate: {
      type: Date,
      required: [true, "Match date is required"],
    },
    venue: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "played", "postponed"],
      default: "scheduled",
    },
    homeScore: {
      type: Number,
      min: 0,
      default: null,
    },
    awayScore: {
      type: Number,
      min: 0,
      default: null,
    },
    homeScorers: [GoalScorerSchema],
    awayScorers: [GoalScorerSchema],
    round: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

MatchSchema.index({ homeTeam: 1, awayTeam: 1, matchDate: 1 });

module.exports = mongoose.model("Match", MatchSchema);
