import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import Signup from "../auth/Signup";
import ForgotPassword from "../auth/ForgotPassword";

import PlayerHome from "../pages/player/PlayerHome";
import Tournaments from "../pages/player/Tournaments";
import News from "../pages/player/News";
import Contact from "../pages/player/Contact";
import PlayerProfile from "../pages/player/PlayerProfile";
import TournamentDetails from "../pages/player/TournamentDetails";
import PaymentFailure from "../pages/player/PaymentFailure";
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminTournaments from "../pages/admin/AdminTournaments";
import AdminLogs from "../pages/admin/AdminLogs";
import AdminSettings from "../pages/admin/AdminSettings";

import ProtectedRoute from "./ProtectedRoutes";
import PublicOnlyRoute from "./PublicOnlyRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - only when not logged in */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

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
        path="/tournament/:id"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <TournamentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/failure"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <PaymentFailure />
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
        path="/player/contact"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <Contact />
          </ProtectedRoute>
        }
      />

      <Route
        path="/player/profile"
        element={
          <ProtectedRoute allowedRoles={["player"]}>
            <PlayerProfile />
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

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tournaments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTournaments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
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
