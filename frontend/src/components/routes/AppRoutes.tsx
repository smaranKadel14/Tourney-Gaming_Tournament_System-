import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import Signup from "../auth/Signup";

import PlayerHome from "../pages/player/PlayerHome";
import Tournaments from "../pages/player/Tournaments";
import News from "../pages/player/News";
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "./ProtectedRoutes";
import PublicOnlyRoute from "./PublicOnlyRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - only when not logged in */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

      {/* Protected routes - only when logged in with correct role */}
      <Route
        path="/player"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <PlayerHome />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/player/tournaments"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <Tournaments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/player/news"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <News />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default route - redirect based on auth state */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* 404 route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
