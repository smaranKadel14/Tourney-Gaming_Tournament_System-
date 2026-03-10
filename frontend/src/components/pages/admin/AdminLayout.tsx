import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuthUser } from "../../../utils/auth";
import "./AdminDashboard.css";

interface AdminLayoutProps {
  children: ReactNode;
  breadcrumb: string;
  search?: string;
  onSearch?: (value: string) => void;
  showInvite?: boolean;
}

const AdminLayout = ({ children, breadcrumb, search, onSearch, showInvite }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthUser();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">LOGO</div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${isActive('/admin') || isActive('/admin/dashboard') ? 'admin-nav-item--active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            <span className="admin-nav-ic">▦</span> Dashboard
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/users') ? 'admin-nav-item--active' : ''}`}
            onClick={() => navigate('/admin/users')}
          >
            <span className="admin-nav-ic">👥</span> Users
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/tournaments') ? 'admin-nav-item--active' : ''}`}
            onClick={() => navigate('/admin/tournaments')}
          >
            <span className="admin-nav-ic">🏆</span> Tournaments
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/logs') ? 'admin-nav-item--active' : ''}`}
            onClick={() => navigate('/admin/logs')}
          >
            <span className="admin-nav-ic">📄</span> System Logs
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/settings') ? 'admin-nav-item--active' : ''}`}
            onClick={() => navigate('/admin/settings')}
          >
            <span className="admin-nav-ic">⚙️</span> Settings
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button onClick={handleLogout} className="admin-logout">
            <span className="admin-nav-ic">⟵</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-breadcrumb">Home / <span>{breadcrumb}</span></div>

          <div className="admin-topbar-right">
            {onSearch && (
              <div className="admin-search-wrap">
                <span className="admin-search-ic">🔎</span>
                <input
                  value={search || ''}
                  onChange={(e) => onSearch(e.target.value)}
                  className="admin-search-input"
                  placeholder="Search..."
                />
              </div>
            )}
            {showInvite && (
              <button className="admin-btn admin-btn--secondary">
                <span className="admin-btn-ic">👤+</span> Invite User
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
