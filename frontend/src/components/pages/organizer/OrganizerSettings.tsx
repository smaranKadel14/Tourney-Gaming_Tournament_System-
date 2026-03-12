import { useState, useEffect } from "react";
import "./OrganizerSettings.css";
import { User, Palette, Bell, Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { getToken, getAuthUser, saveAuth } from "../../../utils/auth";

type Msg = { type: "success" | "error"; text: string };

const OrganizerSettings = () => {
  const [activeTab, setActiveTab] = useState<"Profile" | "Appearance" | "Notifications" | "Security">("Profile");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // --- Profile tab ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [bio, setBio]             = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileMsg, setProfileMsg]         = useState<Msg | null>(null);

  // --- Security tab ---
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwMsg,      setPwMsg]      = useState<Msg | null>(null);

  const token = getToken();

  // Load profile and theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme as "light" | "dark");

    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const parts = (data.fullName || "").split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setEmail(data.email || "");
          setBio(data.bio || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleThemeChange = (t: "light" | "dark") => {
    setTheme(t);
    localStorage.setItem("app-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: "Profile saved successfully." });
        // Update cached user name so sidebar reflects the change immediately
        const authUser = getAuthUser();
        if (authUser && token) saveAuth(token, { ...authUser, fullName });
        // fire storage event so other components can re-read if needed
        window.dispatchEvent(new Event("storage"));
      } else {
        setProfileMsg({ type: "error", text: data.message || "Failed to save profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Server error. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: "success", text: "Password updated successfully." });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        setPwMsg({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch {
      setPwMsg({ type: "error", text: "Server error. Please try again." });
    } finally {
      setPwSaving(false);
    }
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
          {(["Profile", "Appearance", "Notifications", "Security"] as const).map((tab) => {
            const Icon = tab === "Profile" ? User : tab === "Appearance" ? Palette : tab === "Notifications" ? Bell : Lock;
            const label = tab === "Security" ? "Security & Privacy" : tab === "Profile" ? "Profile Information" : tab;
            return (
              <button
                key={tab}
                className={`os-tab ${activeTab === tab ? "os-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <Icon className="os-icon" size={18} /> {label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="os-content">

          {/* ── Profile ── */}
          {activeTab === "Profile" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Profile Information</h3>
              <p className="os-section-desc">Update your personal details and organizer profile.</p>

              {profileMsg && (
                <div className={`os-alert os-alert--${profileMsg.type}`}>
                  {profileMsg.type === "success" ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {profileMsg.text}
                </div>
              )}

              {profileLoading ? (
                <div className="os-loading"><div className="os-spinner" /></div>
              ) : (
                <div className="os-form">
                  <div className="os-form-row">
                    <div className="os-form-group">
                      <label>First Name</label>
                      <input type="text" className="os-input" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="os-form-group">
                      <label>Last Name</label>
                      <input type="text" className="os-input" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="os-form-group">
                    <label>Email Address <span className="os-hint">(cannot be changed)</span></label>
                    <input type="email" className="os-input os-input--disabled" value={email} readOnly />
                  </div>
                  <div className="os-form-group">
                    <label>Bio</label>
                    <textarea className="os-textarea" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell players about yourself or your organization..." />
                  </div>
                </div>
              )}

              <div className="os-form-actions">
                <button className="os-save-btn" onClick={handleSaveProfile} disabled={profileSaving || profileLoading}>
                  {profileSaving ? <Loader2 size={15} className="os-spin" /> : null}
                  {profileSaving ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "Notifications" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Email Notifications</h3>
              <p className="os-section-desc">Choose what we email you about.</p>

              <div className="os-toggle-list">
                {[
                  { label: "New Registrations", desc: "Get notified when a player registers for your tournament.", def: true },
                  { label: "Tournament Start Reminders", desc: "Receive a reminder 24 hours before your tournament begins.", def: true },
                  { label: "Platform Updates", desc: "News about product and feature updates.", def: false },
                ].map(({ label, desc, def }) => (
                  <div key={label} className="os-toggle-item">
                    <div>
                      <div className="os-toggle-label">{label}</div>
                      <div className="os-toggle-desc">{desc}</div>
                    </div>
                    <label className="os-switch">
                      <input type="checkbox" defaultChecked={def} />
                      <span className="os-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="os-form-actions">
                <button className="os-save-btn">Save Notification Preferences</button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === "Appearance" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Theme Preferences</h3>
              <p className="os-section-desc">Customize the look and feel of your dashboard.</p>

              <div className="os-theme-options">
                {(["dark", "light"] as const).map(t => (
                  <button
                    key={t}
                    className={`os-theme-btn ${theme === t ? "os-theme-btn--active" : ""}`}
                    onClick={() => handleThemeChange(t)}
                  >
                    <div className={`os-theme-preview os-theme-preview--${t}`}>
                      <div className="os-theme-circle"></div>
                      <div className="os-theme-lines"><div></div><div></div></div>
                    </div>
                    <span className="os-theme-label">{t === "dark" ? "Dark Mode" : "Light Mode"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === "Security" && (
            <div className="os-section animate-fade-in">
              <h3 className="os-section-title">Change Password</h3>
              <p className="os-section-desc">Update your password associated with your account.</p>

              {pwMsg && (
                <div className={`os-alert os-alert--${pwMsg.type}`}>
                  {pwMsg.type === "success" ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {pwMsg.text}
                </div>
              )}

              <div className="os-form">
                <div className="os-form-group">
                  <label>Current Password</label>
                  <input type="password" className="os-input" placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                </div>
                <div className="os-form-group">
                  <label>New Password</label>
                  <input type="password" className="os-input" placeholder="At least 6 characters" value={newPw} onChange={e => setNewPw(e.target.value)} />
                </div>
                <div className="os-form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="os-input" placeholder="Repeat new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
                <button className="os-btn os-btn--outline" style={{ marginTop: "10px", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }} onClick={handleChangePassword} disabled={pwSaving}>
                  {pwSaving ? <Loader2 size={15} className="os-spin" /> : null}
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>

              <div className="os-divider"></div>

              <h3 className="os-section-title" style={{ color: "#ef4444" }}>Danger Zone</h3>
              <p className="os-section-desc">Permanently delete your account and all of your content.</p>
              <button className="os-btn os-btn--danger-solid" style={{ marginTop: "16px" }}>Delete Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerSettings;
