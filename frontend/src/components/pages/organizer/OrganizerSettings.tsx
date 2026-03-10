import { useState, useEffect } from "react";
import "./OrganizerSettings.css";

const OrganizerSettings = () => {
  const [activeTab, setActiveTab] = useState<"Profile" | "Appearance" | "Notifications" | "Security">("Profile");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme as "light" | "dark");
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="os-container animate-fade-in">
      <div className="os-header">
        <div>
          <h2 className="os-title">Settings</h2>
          <p className="os-subtitle">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="os-layout">
        {/* Settings Sidebar */}
        <div className="os-sidebar">
          <button 
            className={`os-tab ${activeTab === "Profile" ? "os-tab--active" : ""}`}
            onClick={() => setActiveTab("Profile")}
          >
            <span className="os-icon">👤</span> Profile Information
          </button>
          <button 
            className={`os-tab ${activeTab === "Appearance" ? "os-tab--active" : ""}`}
            onClick={() => setActiveTab("Appearance")}
          >
            <span className="os-icon">🎨</span> Appearance
          </button>
          <button 
            className={`os-tab ${activeTab === "Notifications" ? "os-tab--active" : ""}`}
            onClick={() => setActiveTab("Notifications")}
          >
            <span className="os-icon">🔔</span> Notifications
          </button>
          <button 
            className={`os-tab ${activeTab === "Security" ? "os-tab--active" : ""}`}
            onClick={() => setActiveTab("Security")}
          >
            <span className="os-icon">🔒</span> Security & Privacy
          </button>
        </div>

        {/* Settings Content */}
        <div className="os-content">
          {activeTab === "Profile" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Profile Information</h3>
              <p className="os-section-desc">Update your personal details and organizer profile.</p>

              <div className="os-avatar-section">
                <div className="os-avatar-lg">A</div>
                <div className="os-avatar-actions">
                  <button className="os-btn os-btn--outline">Change Avatar</button>
                  <button className="os-btn os-btn--danger">Remove</button>
                </div>
              </div>

              <div className="os-form">
                <div className="os-form-row">
                  <div className="os-form-group">
                    <label>First Name</label>
                    <input type="text" className="os-input" defaultValue="Alex" />
                  </div>
                  <div className="os-form-group">
                    <label>Last Name</label>
                    <input type="text" className="os-input" defaultValue="Morgan" />
                  </div>
                </div>
                <div className="os-form-group">
                  <label>Email Address</label>
                  <input type="email" className="os-input" defaultValue="alex@gameframe.io" />
                </div>
                <div className="os-form-group">
                  <label>Organizer / Org Name</label>
                  <input type="text" className="os-input" defaultValue="GameFrame Esports" />
                </div>
                <div className="os-form-group">
                  <label>Bio</label>
                  <textarea className="os-textarea" rows={4} defaultValue="We organize the best competitive gaming events in the region." />
                </div>
              </div>

              <div className="os-form-actions">
                <button className="os-save-btn">Save Profile Changes</button>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Email Notifications</h3>
              <p className="os-section-desc">Choose what we email you about.</p>

              <div className="os-toggle-list">
                <div className="os-toggle-item">
                  <div>
                    <div className="os-toggle-label">New Registrations</div>
                    <div className="os-toggle-desc">Get notified when a player registers for your tournament.</div>
                  </div>
                  <label className="os-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="os-slider"></span>
                  </label>
                </div>
                
                <div className="os-toggle-item">
                  <div>
                    <div className="os-toggle-label">Tournament Start Reminders</div>
                    <div className="os-toggle-desc">Receive a reminder 24 hours before your tournament begins.</div>
                  </div>
                  <label className="os-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="os-slider"></span>
                  </label>
                </div>

                <div className="os-toggle-item">
                  <div>
                    <div className="os-toggle-label">Platform Updates</div>
                    <div className="os-toggle-desc">News about product and feature updates.</div>
                  </div>
                  <label className="os-switch">
                    <input type="checkbox" />
                    <span className="os-slider"></span>
                  </label>
                </div>
              </div>

              <div className="os-form-actions">
                <button className="os-save-btn">Save Notification Preferences</button>
              </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Theme Preferences</h3>
              <p className="os-section-desc">Customize the look and feel of your dashboard.</p>

              <div className="os-theme-options">
                <button 
                  className={`os-theme-btn ${theme === "dark" ? "os-theme-btn--active" : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <div className="os-theme-preview os-theme-preview--dark">
                    <div className="os-theme-circle"></div>
                    <div className="os-theme-lines"><div></div><div></div></div>
                  </div>
                  <span className="os-theme-label">Dark Mode</span>
                </button>

                <button 
                  className={`os-theme-btn ${theme === "light" ? "os-theme-btn--active" : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  <div className="os-theme-preview os-theme-preview--light">
                    <div className="os-theme-circle"></div>
                    <div className="os-theme-lines"><div></div><div></div></div>
                  </div>
                  <span className="os-theme-label">Light Mode</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Change Password</h3>
              <p className="os-section-desc">Update your password associated with your account.</p>

              <div className="os-form">
                <div className="os-form-group">
                  <label>Current Password</label>
                  <input type="password" className="os-input" placeholder="••••••••" />
                </div>
                <div className="os-form-group">
                  <label>New Password</label>
                  <input type="password" className="os-input" placeholder="Enter new password" />
                </div>
                <div className="os-form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="os-input" placeholder="Confirm new password" />
                </div>
                <button className="os-btn os-btn--outline" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>Update Password</button>
              </div>

              <div className="os-divider"></div>

              <h3 className="os-section-title" style={{ color: '#ef4444' }}>Danger Zone</h3>
              <p className="os-section-desc">Permanently delete your account and all of your content.</p>
              <button className="os-btn os-btn--danger-solid" style={{ marginTop: '16px' }}>Delete Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerSettings;
