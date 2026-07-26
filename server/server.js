require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const teamRoutes = require("./routes/teams");
const playerRoutes = require("./routes/players");
const matchRoutes = require("./routes/matches");
const standingsRoutes = require("./routes/standings");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Football League Manager API is running" });
});

app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/standings", standingsRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Central error handler (catches anything thrown/rejected that wasn't handled)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
