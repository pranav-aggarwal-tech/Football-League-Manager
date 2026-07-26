// Seeds the database with sample teams, players, and matches (some played, some
// scheduled) so the app has real data to demo immediately after setup.
require("dotenv").config();
const connectDB = require("./config/db");
const Team = require("./models/Team");
const Player = require("./models/Player");
const Match = require("./models/Match");
const { recalculateAllPlayerStats } = require("./controllers/statsService");

const teamSeed = [
  { name: "Ironclad United", city: "Riverport", crestColor: "#1D4ED8", coach: "M. Okafor", foundedYear: 1974 },
  { name: "Harborview FC", city: "Harborview", crestColor: "#DC2626", coach: "S. Larsen", foundedYear: 1962 },
  { name: "Granite City Rovers", city: "Granite City", crestColor: "#059669", coach: "A. Dimitriou", foundedYear: 1988 },
  { name: "Northfield Athletic", city: "Northfield", crestColor: "#D97706", coach: "R. Kowalski", foundedYear: 1955 },
  { name: "Sable Valley SC", city: "Sable Valley", crestColor: "#7C3AED", coach: "T. Nakamura", foundedYear: 2001 },
  { name: "Old Mill Town FC", city: "Old Mill", crestColor: "#0891B2", coach: "P. Osei", foundedYear: 1949 },
];

const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const firstNames = ["Liam", "Noah", "Elias", "Marco", "Kwame", "Diego", "Ivan", "Yusuf", "Theo", "Rafael", "Owen", "Jamal", "Luca", "Mateo", "Sami"];
const lastNames = ["Rossi", "Nakamura", "Silva", "Baker", "Kovac", "Mensah", "Torres", "Petrov", "Diallo", "Reyes", "Fischer", "Novak", "Boateng", "Sousa"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([Team.deleteMany({}), Player.deleteMany({}), Match.deleteMany({})]);

  console.log("Creating teams...");
  const teams = await Team.insertMany(teamSeed);

  console.log("Creating players...");
  const playersByTeam = {};
  for (const team of teams) {
    const squad = [];
    let jersey = 1;
    // 2 keepers, 5 defenders, 6 midfielders, 4 forwards = 17-player squad
    const roster = [
      ...Array(2).fill("Goalkeeper"),
      ...Array(5).fill("Defender"),
      ...Array(6).fill("Midfielder"),
      ...Array(4).fill("Forward"),
    ];
    for (const position of roster) {
      squad.push({
        name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        team: team._id,
        position,
        jerseyNumber: jersey++,
        age: 18 + Math.floor(Math.random() * 17),
        nationality: randomFrom(["BRA", "ARG", "GHA", "JPN", "ESP", "FRA", "NGA", "USA", "CRO", "MAR"]),
      });
    }
    const created = await Player.insertMany(squad);
    playersByTeam[team._id] = created;
  }

  console.log("Scheduling matches (round robin, first half played, second half upcoming)...");
  const matches = [];
  const today = new Date();

  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      if (i === j) continue;
      const daysOffset = (i * teams.length + j) - (teams.length * teams.length) / 2;
      const matchDate = new Date(today);
      matchDate.setDate(today.getDate() + daysOffset);
      matches.push({
        homeTeam: teams[i]._id,
        awayTeam: teams[j]._id,
        matchDate,
        venue: `${teams[i].city} Stadium`,
        round: daysOffset < 0 ? "Second Half" : "First Half",
        status: daysOffset < 0 ? "played" : "scheduled",
      });
    }
  }

  // Only keep a reasonable subset so it's not 30 matches - pick first 16
  const trimmed = matches.slice(0, 16);

  for (const m of trimmed) {
    if (m.status === "played") {
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);
      const homeSquad = playersByTeam[m.homeTeam].filter((p) => p.position !== "Goalkeeper");
      const awaySquad = playersByTeam[m.awayTeam].filter((p) => p.position !== "Goalkeeper");

      m.homeScore = homeScore;
      m.awayScore = awayScore;
      m.homeScorers = Array.from({ length: homeScore }, () => ({
        player: randomFrom(homeSquad)._id,
        minute: 1 + Math.floor(Math.random() * 90),
      }));
      m.awayScorers = Array.from({ length: awayScore }, () => ({
        player: randomFrom(awaySquad)._id,
        minute: 1 + Math.floor(Math.random() * 90),
      }));
    }
  }

  await Match.insertMany(trimmed);

  console.log("Recalculating player stats from match results...");
  await recalculateAllPlayerStats();

  console.log("Seed complete!");
  console.log(`  Teams: ${teams.length}`);
  console.log(`  Players: ${Object.values(playersByTeam).flat().length}`);
  console.log(`  Matches: ${trimmed.length} (${trimmed.filter((m) => m.status === "played").length} played)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
