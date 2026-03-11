import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Moon, Sun } from "lucide-react";
import "./AdminDashboard.css";

const AdminSettings = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [systemName, setSystemName] = useState("Tourney Gaming System");
  const [supportEmail, setSupportEmail] = useState("support@tourney.com");
  const [platformFee, setPlatformFee] = useState("5.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme as "light" | "dark");
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSaveGeneral = () => {
    alert("General settings saved successfully.");
  };

  return (
    <AdminLayout breadcrumb="Settings">
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Platform Settings</h1>
          <p>Manage system configurations, appearance, and global rules.</p>
        </div>
      </header>

      <div className="admin-content-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* General Settings */}
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>General Configuration</h2>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>System Name</label>
              <div className="admin-search-wrap" style={{ width: '100%', padding: '0 12px' }}>
                <input 
                  type="text" 
                  className="admin-search-input" 
                  style={{ width: '100%', padding: '10px 0' }} 
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Support Email</label>
              <div className="admin-search-wrap" style={{ width: '100%', padding: '0 12px' }}>
                <input 
                  type="email" 
                  className="admin-search-input" 
                  style={{ width: '100%', padding: '10px 0' }} 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
            </div>
            <button className="admin-btn admin-btn--primary" onClick={handleSaveGeneral}>
              Save General Settings
            </button>
          </section>

          {/* Financial Settings */}
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Financials</h2>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Global Platform Fee (%)</label>
              <div className="admin-search-wrap" style={{ width: '160px', padding: '0 12px' }}>
                 <input 
                  type="number" 
                  className="admin-search-input" 
                  style={{ width: '100%', padding: '10px 0' }} 
                  value={platformFee}
                  step="0.1"
                  onChange={(e) => setPlatformFee(e.target.value)}
                />
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              This percentage is automatically deducted from paid tournament registration pools.
            </p>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Appearance Settings */}
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Appearance</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Choose the default theme interface for the Admin Dashboard.
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              {/* Dark Mode Toggle */}
              <div 
                onClick={() => handleThemeChange("dark")}
                style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 12, 
                  border: theme === 'dark' ? '2px solid var(--accent-primary)' : '2px solid var(--border-light)',
                  background: 'var(--bg-panel)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111827', border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={24} color="#e5e7eb" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Dark Mode</span>
              </div>

              {/* Light Mode Toggle */}
              <div 
                onClick={() => handleThemeChange("light")}
                style={{ 
                  flex: 1, 
                  padding: 16, 
                  borderRadius: 12, 
                  border: theme === 'light' ? '2px solid var(--accent-primary)' : '2px solid var(--border-light)',
                  background: 'var(--bg-panel)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sun size={24} color="#f59e0b" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Light Mode</span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="admin-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="admin-panel-head">
              <h2 style={{ color: '#ef4444' }}>Danger Zone</h2>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: 'var(--text-primary)' }}>Maintenance Mode</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Disable access to the platform for non-admins.</div>
              </div>
              
              <button 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="admin-btn"
                style={{ 
                  background: maintenanceMode ? '#ef4444' : 'transparent',
                  color: maintenanceMode ? '#fff' : 'var(--text-primary)',
                  border: maintenanceMode ? 'none' : '1px solid var(--border-light)',
                  minWidth: 100,
                  justifyContent: 'center'
                }}
              >
                {maintenanceMode ? 'ACTIVE' : 'Enable'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: 'var(--text-primary)' }}>Purge System Cache</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Force all clients to fetch fresh assets.</div>
              </div>
              <button className="admin-btn admin-btn--secondary">Purge Cache</button>
            </div>
          </section>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
