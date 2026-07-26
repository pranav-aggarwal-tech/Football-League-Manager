# Matchday — Football League Manager (MERN Stack)

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
```

## Setup (should take ~10 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- A MongoDB connection — either:
  - **Local MongoDB**: install and run `mongod` (fastest for a same-day demo), or
  - **MongoDB Atlas**: free cluster at https://www.mongodb.com/cloud/atlas (no local install needed)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` if you're using Atlas — set `MONGO_URI` to your connection string.
If you're running MongoDB locally with defaults, you can leave it as is.

Seed the database with sample teams, players, and matches (recommended so the
app isn't empty when you demo it):

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 3. Frontend
7
In a **new terminal**:

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`. The Vite dev server proxies `/api` requests
to `http://localhost:5000`, so both servers need to be running at once.

### 4. Open the app

Go to `http://localhost:5173`. You should see the Standings page. If you ran
`npm run seed`, you'll already have 6 teams, ~100 players, and match history to
explore.

## How the league table works

`GET /api/standings` recomputes the table from scratch on every request:

1. Every team starts at 0 points.
2. Every match with `status: "played"` is applied in chronological order:
   win = 3 pts, draw = 1 pt each, loss = 0 pts.
3. Teams are sorted by points → goal difference → goals scored → name.
4. The last 5 results per team are kept as a "form" strip.

Because this is computed live rather than stored, there's no risk of the table
getting out of sync with match results — editing or deleting a match score
just changes what the next `GET /api/standings` call returns.

## API reference (quick)

| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/api/teams` | List / create teams |
| GET/PUT/DELETE | `/api/teams/:id` | Team detail (+ roster + matches) / update / delete |
| GET/POST | `/api/players` | List (filter `?team=` `?position=`) / create players |
| GET | `/api/players/top-scorers?limit=10` | League top scorers |
| GET/PUT/DELETE | `/api/players/:id` | Player detail / update / delete |
| GET/POST | `/api/matches` | List (filter `?status=` `?team=`) / schedule matches |
| GET/PUT/DELETE | `/api/matches/:id` | Match detail / update / delete |
| PATCH | `/api/matches/:id/result` | Record/edit final score + scorers |
| GET | `/api/standings` | Computed live league table |

## If you're demoing this today

1. Run `npm run seed` right before your demo — it gives you a realistic dataset
   in one command instead of manually creating teams.
2. The Standings page (`/`) is the default landing page — that's your strongest
   visual, lead with it.
3. On the Matches page, use "Record Result" on a scheduled fixture to show the
   standings updating live — that's the core "automatic" feature the brief asks for.
