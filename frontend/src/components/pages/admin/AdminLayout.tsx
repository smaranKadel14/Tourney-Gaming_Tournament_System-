import { type ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Trophy, FileText, Settings, LogOut, Search, UserPlus, Mail, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    clearAuthUser();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-shell">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="admin-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-brand">TOURNEY</div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${isActive('/admin') || isActive('/admin/dashboard') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin')}
          >
            <LayoutDashboard className="admin-nav-ic" size={16} /> Dashboard
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/users') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin/users')}
          >
            <Users className="admin-nav-ic" size={16} /> Users
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/tournaments') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin/tournaments')}
          >
            <Trophy className="admin-nav-ic" size={16} /> Tournaments
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/messages') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin/messages')}
          >
            <Mail className="admin-nav-ic" size={16} /> Messages
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/logs') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin/logs')}
          >
            <FileText className="admin-nav-ic" size={16} /> System Logs
          </button>
          <button 
            className={`admin-nav-item ${isActive('/admin/settings') ? 'admin-nav-item--active' : ''}`}
            onClick={() => handleNavigate('/admin/settings')}
          >
            <Settings className="admin-nav-ic" size={16} /> Settings
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button onClick={handleLogout} className="admin-logout">
            <LogOut className="admin-nav-ic" size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Header */}
        <div className="admin-mobile-header">
          <button className="admin-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="admin-brand-mobile">TOURNEY</div>
        </div>

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-breadcrumb">Home / <span>{breadcrumb}</span></div>

          <div className="admin-topbar-right">
            {onSearch && (
              <div className="admin-search-wrap">
                <Search className="admin-search-ic" size={16} />
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    value={search || ''}
                    onChange={(e) => onSearch(e.target.value)}
                    className="admin-search-input"
                    maxLength={50}
                    placeholder="Search..."
                  />
                  {search && search.length >= 50 && (
                    <span className="admin-search-limit">Limit reached (50/50)</span>
                  )}
                </div>
              </div>
            )}
            {showInvite && (
              <button className="admin-btn admin-btn--secondary">
                <UserPlus className="admin-btn-ic" size={16} /> Invite User
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
