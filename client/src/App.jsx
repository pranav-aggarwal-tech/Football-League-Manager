import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Standings from "./pages/Standings.jsx";
import Teams from "./pages/Teams.jsx";
import TeamDetail from "./pages/TeamDetail.jsx";
import Players from "./pages/Players.jsx";
import Matches from "./pages/Matches.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Standings />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/players" element={<Players />} />
          <Route path="/matches" element={<Matches />} />
        </Routes>
      </main>
    </div>
  );
}
