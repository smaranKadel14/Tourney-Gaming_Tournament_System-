import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Settings, DollarSign, Palette, AlertTriangle, Loader2 } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./AdminDashboard.css";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<"General" | "Financials" | "Appearance" | "Danger Zone">("General");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  // Settings State
  const [systemName, setSystemName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [platformFee, setPlatformFee] = useState("5.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme as "light" | "dark");
  }, []);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/admin/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSystemName(data.systemName || "Tourney Gaming System");
          setSupportEmail(data.supportEmail || "support@tourney.com");
          if (data.platformFee !== undefined) setPlatformFee(data.platformFee.toString());
          if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          systemName,
          supportEmail,
          platformFee: parseFloat(platformFee),
          maintenanceMode
        })
      });
      if (res.ok) {
        alert("Platform settings saved successfully!");
      } else {
        const err = await res.json();
        alert(`Error saving settings: ${err.message}`);
      }
    } catch (err) {
      alert("Server error. Could not update platform settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/admin/purge-cache", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.removeItem("app-theme");
        alert("System Cache successfully purged and recorded in system logs!");
        window.location.reload();
      } else {
        alert("Failed to purge cache on server.");
      }
    } catch (e) {
      alert("Error contacting server to purge cache.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const newState = !maintenanceMode;
    const confirmMsg = newState 
      ? "Are you sure you want to ACTIVATE Maintenance Mode? This will lock out all non-admin users immediately."
      : "Are you sure you want to DEACTIVATE Maintenance Mode? This will allow public access again.";
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          systemName,
          supportEmail,
          platformFee: parseFloat(platformFee),
          maintenanceMode: newState // Auto-deploy the click
        })
      });
      if (res.ok) {
        setMaintenanceMode(newState);
        alert(`Maintenance Mode has been successfully ${newState ? 'ACTIVATED' : 'DISABLED'}.`);
      } else {
        alert("Failed to toggle maintenance mode.");
      }
    } catch (e) {
      alert("Server error deploying mode update.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = ["General", "Financials", "Appearance", "Danger Zone"] as const;

  return (
    <AdminLayout breadcrumb="Settings">
      {/* Scope CSS for neat forms instead of relying on navbar search bounds */}
      <style>{`
        .settings-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.4); /* darker recessed look inside panels */
          border: 1px solid var(--border-medium, #334155);
          border-radius: 8px;
          color: var(--text-primary-bright, #fff);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .settings-input:focus {
          outline: none;
          border-color: var(--accent-primary, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          background: rgba(15, 23, 42, 0.6);
        }
        .settings-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 8px;
          letter-spacing: 0.2px;
        }
        .settings-form-group {
          margin-bottom: 24px;
        }
        .settings-container {
          max-width: 560px; /* Constrains input width to look proper */
        }
        .settings-section-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary-bright);
        }
        .settings-section-desc {
          margin: 0 0 32px 0;
          font-size: 14px;
          color: var(--text-muted);
        }
        .settings-divider {
          height: 1px;
          background: var(--border-light);
          margin: 32px 0;
        }
      `}</style>

      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Platform Settings</h1>
          <p>Manage system configurations, appearance, and global rules.</p>
        </div>
      </header>

      {/* Main Grid Layout for Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', padding: '0 32px 32px', alignItems: 'start' }}>
        
        {/* Settings Sidebar utilizing native admin-nav-item classes */}
        <div className="admin-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px', paddingLeft: '8px' }}>
            Configuration
          </div>
          {tabs.map((tab) => {
            const Icon = 
              tab === "General" ? Settings : 
              tab === "Financials" ? DollarSign : 
              tab === "Appearance" ? Palette : 
              AlertTriangle;
              
            return (
              <button
                key={tab}
                className={`admin-nav-item ${activeTab === tab ? "admin-nav-item--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <Icon size={18} /> {tab}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="admin-panel" style={{ minHeight: '500px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
               <Loader2 size={32} className="os-spin" color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
               <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>

              {/* ── General Tab ── */}
              {activeTab === "General" && (
                <div className="settings-container">
                  <h2 className="settings-section-title">General Configuration</h2>
                  <p className="settings-section-desc">Manage core details and support information for the platform.</p>
                  
                  <div className="settings-form-group">
                    <label className="settings-label">System Name</label>
                    <input 
                      type="text" 
                      className="settings-input" 
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      placeholder="e.g., Tourney Gaming System"
                    />
                  </div>
                  
                  <div className="settings-form-group">
                    <label className="settings-label">Support Email</label>
                    <input 
                      type="email" 
                      className="settings-input" 
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@domain.com"
                    />
                  </div>

                  <div className="settings-divider"></div>

                  <button className="admin-btn admin-btn--primary" style={{ width: 'max-content' }} onClick={handleSaveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save General Settings"}
                  </button>
                </div>
              )}

              {/* ── Financials Tab ── */}
              {activeTab === "Financials" && (
                <div className="settings-container">
                  <h2 className="settings-section-title">Financials</h2>
                  <p className="settings-section-desc">Configure platform fees and monetization rules.</p>
                  
                  <div className="settings-form-group" style={{ maxWidth: '240px' }}>
                    <label className="settings-label">Global Platform Fee (%)</label>
                    <input 
                      type="number" 
                      className="settings-input" 
                      value={platformFee}
                      step="0.1"
                      onChange={(e) => setPlatformFee(e.target.value)}
                    />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                      This percentage is automatically deducted from paid tournament registration pools.
                    </p>
                  </div>
                  
                  <div className="settings-divider"></div>

                  <button className="admin-btn admin-btn--primary" style={{ width: 'max-content' }} onClick={handleSaveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Financial Rules"}
                  </button>
                </div>
              )}

              {/* ── Appearance Tab ── */}
              {activeTab === "Appearance" && (
                <div className="settings-container">
                  <h2 className="settings-section-title">Appearance</h2>
                  <p className="settings-section-desc">Customize the look and feel of your Admin Dashboard.</p>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    {(["dark", "light"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        style={{
                          background: 'transparent',
                          border: theme === t ? '2px solid var(--accent-primary)' : '2px solid var(--border-medium)',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          width: '160px',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          backgroundColor: theme === t ? 'var(--accent-transparent)' : 'var(--bg-input)'
                        }}
                      >
                        <div style={{
                          height: '80px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          marginBottom: '16px',
                          background: t === 'dark' ? '#0f172a' : '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '10px',
                          gap: '8px'
                        }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t === 'dark' ? '#334155' : '#cbd5e1' }}></div>
                          <div style={{ height: '6px', borderRadius: '4px', width: '80%', background: t === 'dark' ? '#1e293b' : '#e2e8f0' }}></div>
                          <div style={{ height: '6px', borderRadius: '4px', width: '40%', background: t === 'dark' ? '#1e293b' : '#e2e8f0' }}></div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t === "dark" ? "Dark Mode" : "Light Mode"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Danger Zone Tab ── */}
              {activeTab === "Danger Zone" && (
                <div className="settings-container" style={{ maxWidth: '100%' }}>
                  <h2 className="settings-section-title" style={{ color: '#ef4444' }}>Danger Zone</h2>
                  <p className="settings-section-desc">Critical platform operations that affect all users.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary-bright)' }}>Maintenance Mode</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Disable access to the platform for non-admins immediately.</div>
                        <div style={{ marginTop: '8px', display: 'inline-block', padding: '4px 8px', background: maintenanceMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)', borderRadius: '4px', fontSize: '12px', color: maintenanceMode ? '#ef4444' : 'var(--text-muted)', fontWeight: 600, border: maintenanceMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent' }}>
                          Status: {maintenanceMode ? 'ACTIVE (PLATFORM LOCKED)' : 'INACTIVE'}
                        </div>
                      </div>
                      <button 
                        onClick={handleToggleMaintenance}
                        disabled={saving}
                        style={{ 
                          background: maintenanceMode ? 'transparent' : '#ef4444',
                          color: maintenanceMode ? '#ef4444' : '#fff',
                          border: maintenanceMode ? '1px solid #ef4444' : 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minWidth: '140px',
                          transition: 'all 0.2s',
                          opacity: saving ? 0.6 : 1
                        }}
                      >
                        {saving ? "Deploying..." : (maintenanceMode ? "Deactivate Mode" : "Activate Mode")}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary-bright)' }}>Purge System Cache</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Force all connected clients to fetch fresh assets.</div>
                      </div>
                      <button 
                        className="admin-btn admin-btn--outline" 
                        style={{ border: '1px solid var(--border-medium)', justifyContent: 'center', minWidth: '140px' }}
                        onClick={handlePurgeCache}
                        disabled={saving}
                      >
                        {saving ? "Purging..." : "Purge Cache"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
