Football League Manager (MERN Stack)

A full-stack football league management app: create teams, build rosters, schedule
matches, record scores with goal scorers, and get an automatically-computed live
league table — all built on MongoDB, Express, React, and Node.

## Features

- **Teams** — create/edit/delete teams with a generated crest, coach, city, founding year
- **Players** — full roster per team (position, jersey number, age, nationality), league-wide player browser with filters, top scorers leaderboard
- **Matches** — schedule fixtures, record final scores + goal scorers with minute, filter by status (scheduled / played / postponed), edit or delete results
- **Standings** — auto-generated league table (points, W/D/L, GF/GA/GD, recent form) recalculated live from match results — no manual point entry
- **Data integrity** — player goal/appearance stats are recalculated from match history on every score change, so they can never drift out of sync

## Tech stack

- **Backend:** Node.js, Express, Mongoose, MongoDB
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios

## Project structure

```
football-league-manager/
├── server/              Express API
│   ├── config/db.js
│   ├── models/          Team, Player, Match (Mongoose schemas)
│   ├── controllers/     Route logic + standings algorithm + stats sync
│   ├── routes/
│   ├── seed.js          Sample data generator
│   └── server.js
└── client/               React app
    └── src/
        ├── pages/        Standings, Teams, TeamDetail, Players, Matches
        ├── components/   Navbar, TeamBadge
        └── api/axios.js

