import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import Signup from "../auth/Signup";

import PlayerHome from "../pages/player/PlayerHome";
// import OrganizerHome from "../pages/organizer/OrganizerHome";
// import AdminHome from "../pages/admin/AdminHome";

import ProtectedRoute from "../routes/ProtectedRoutes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* protected */}
        <Route
          path="/player"
          element={
            <ProtectedRoute allowedRoles={["player"]}>
              <PlayerHome />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <OrganizerHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        /> */}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
