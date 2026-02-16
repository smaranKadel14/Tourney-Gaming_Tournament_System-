import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import PlayerHome from "./components/pages/player/PlayerHome";
import OrganizerDashboard from "./components/pages/organizer/OrganizerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/player" element={<PlayerHome />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;