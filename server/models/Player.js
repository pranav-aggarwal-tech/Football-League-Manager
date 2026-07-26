const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
      maxlength: 60,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Player must belong to a team"],
    },
    position: {
      type: String,
      enum: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
      required: true,
    },
    jerseyNumber: {
      type: Number,
      min: 1,
      max: 99,
    },
    age: {
      type: Number,
      min: 14,
      max: 50,
    },
    nationality: {
      type: String,
      trim: true,
      default: "",
    },
    goals: {
      type: Number,
      default: 0,
      min: 0,
    },
    assists: {
      type: Number,
      default: 0,
      min: 0,
    },
    appearances: {
      type: Number,
      default: 0,
      min: 0,
    },
    yellowCards: {
      type: Number,
      default: 0,
      min: 0,
    },
    redCards: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate jersey numbers within the same team
PlayerSchema.index({ team: 1, jerseyNumber: 1 }, { unique: true, partialFilterExpression: { jerseyNumber: { $type: "number" } } });

module.exports = mongoose.model("Player", PlayerSchema);
