const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      unique: true,
      trim: true,
      maxlength: 60,
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: 4,
      uppercase: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    foundedYear: {
      type: Number,
      min: 1850,
      max: new Date().getFullYear(),
    },
    crestColor: {
      // Hex color used by the frontend to render a generated crest/badge
      type: String,
      default: "#0B3D26",
    },
    coach: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate a 3-letter short name from the team name if not provided
TeamSchema.pre("validate", function (next) {
  if (!this.shortName && this.name) {
    this.shortName = this.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "TBD";
  }
  next();
});

module.exports = mongoose.model("Team", TeamSchema);
