import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuthUser, roleHomePath, type Role, clearAuthUser } from "../../utils/auth";
import { Loader2, LogOut } from "lucide-react";

type Props = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const user = getAuthUser();
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/system/status")
      .then(r => r.json())
      .then(data => setMaintenance(data.maintenanceMode))
      .catch(() => setMaintenance(false));
  }, []);

  if (maintenance === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a' }}>
        <Loader2 size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Block protected routes if under maintenance, unless it's an admin
  if (maintenance && user?.role !== "admin") {
    return (
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#f8fafc', padding: 20, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <button 
          onClick={() => {
            clearAuthUser();
            window.location.replace("/login");
          }}
          title="Sign out and return to login"
          style={{ position: 'absolute', top: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <LogOut size={18} />
        </button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛠</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, margin: 0 }}>System Under Maintenance</h1>
        <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 460, lineHeight: 1.5, marginTop: 12 }}>
          Tourney Gaming System is currently undergoing scheduled platform upgrades. We will be back online shortly!
        </p>
      </div>
    );
  }

  // if not logged in, send to login
  if (!user) return <Navigate to="/login" replace />;

  // if logged in but role not allowed, send to their dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  // otherwise, render children
  return <>{children}</>;
}
