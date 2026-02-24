import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PlayerNavbar from "./PlayerNavbar";
import { getToken } from "../../../utils/auth";
import ImageCropper from "../../common/ImageCropper";
import "./PlayerProfile.css";

// Assets
import bg from "../../../assets/bg.png";
import defAvatar from "../../../assets/home/gamer.png";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

export default function PlayerProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", bio: "" });
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProfile(res.data);
      setEditForm({ fullName: res.data.fullName, bio: res.data.bio || "" });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        { avatarUrl: "" },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to remove avatar", err);
    }
  };

  const handleUploadAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Reset file input
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

    try {
      await axios.post("http://localhost:5000/api/users/avatar", formData, {
        headers: {
           Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchProfile();
      setImageToCrop(null);
    } catch (err) {
      console.error("Failed to upload avatar", err);
      alert("Found an issue uploading the image.");
    }
  };

  const handleCropCancel = () => setImageToCrop(null);

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        editForm,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    }
  };

  // Resolve avatar URL formatting 
  const displayAvatar = profile?.avatarUrl 
    ? `http://localhost:5000${profile.avatarUrl}` 
    : defAvatar;

  return (
    <div className="pp-page">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        accept="image/jpeg, image/png, image/jpg, image/webp" 
        onChange={handleFileChange} 
      />
      {/* Background with Purple Glow */}
      <div className="pp-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pp-overlay" />

      <div className="pp-wrap">
        <PlayerNavbar />

        <div className="pp-content">
          {/* 1. Profile Identity Header */}
          <section className="pp-header">
            <div className="pp-avatar-wrapper">
                <div 
                className="pp-avatar" 
                style={{ backgroundImage: `url(${displayAvatar})` }}
              >
                
                <div className="pp-avatar-overlay">
                  <button className="pp-btn-icon" onClick={handleUploadAvatar} title="Upload New">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                  </button>
                  {profile?.avatarUrl && (
                    <button className="pp-btn-icon pp-btn-danger" onClick={handleRemoveAvatar} title="Remove">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pp-identity">
              {isEditing ? (
                 <div className="pp-edit-form">
                   <input 
                     type="text" 
                     className="pp-edit-input" 
                     value={editForm.fullName} 
                     onChange={e => setEditForm(prev => ({...prev, fullName: e.target.value}))}
                     placeholder="Display Name"
                   />
                   <span className="pp-email">{profile?.email || "loading..."}</span>
                   <textarea 
                     className="pp-edit-textarea" 
                     value={editForm.bio} 
                     onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                     placeholder="Write a bio about yourself..."
                   />
                   <div className="pp-edit-actions">
                     <button className="pp-btn-save" onClick={handleSaveProfile}>Save Changes</button>
                     <button className="pp-btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                   </div>
                 </div>
              ) : (
                 <>
                  <h1 className="pp-username">{profile?.fullName || "Loading..."}</h1>
                  <span className="pp-email">{profile?.email || "loading..."}</span>
                  <p className="pp-bio">
                    {profile?.bio || "No bio added yet. Click 'Edit Profile' to write something about yourself!"}
                  </p>
                  <button className="pp-btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
                 </>
              )}
            </div>
          </section>

          {/* 2. Quick Statistics */}
          <section className="pp-stats">
            <div className="pp-stat-card">
              <div className="pp-stat-value">14</div>
              <div className="pp-stat-label">Tournaments Played</div>
            </div>
            <div className="pp-stat-card">
              <div className="pp-stat-value">65%</div>
              <div className="pp-stat-label">Overall Win Rate</div>
            </div>
            <div className="pp-stat-card">
              <div className="pp-stat-value" style={{ fontSize: "28px" }}>Valorant</div>
              <div className="pp-stat-label">Favorite Game</div>
            </div>
          </section>

          <div className="pp-grid">
            {/* 3. Tournament History */}
            <section className="pp-history">
              <h2 className="pp-section-title">Tournament History</h2>
              <div className="pp-table-container">
                <table className="pp-table">
                  <thead>
                    <tr>
                      <th>Tournament Name</th>
                      <th>Game</th>
                      <th>Date</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Winter Cash Cup</td>
                      <td>Valorant</td>
                      <td>Dec 15, 2025</td>
                      <td><span className="pp-badge pp-badge-win">1st Place</span></td>
                    </tr>
                    <tr>
                      <td>Global Royale Open</td>
                      <td>Call of Duty: Warzone</td>
                      <td>Oct 02, 2025</td>
                      <td><span className="pp-badge pp-badge-loss">Eliminated (Round 2)</span></td>
                    </tr>
                    <tr>
                      <td>Weekly Clash</td>
                      <td>League of Legends</td>
                      <td>Sep 19, 2025</td>
                      <td><span className="pp-badge pp-badge-win">Semi-Finalist</span></td>
                    </tr>
                    <tr>
                      <td>CS:GO Local Qualifiers</td>
                      <td>CS:GO</td>
                      <td>Aug 11, 2025</td>
                      <td><span className="pp-badge pp-badge-loss">Eliminated (Groups)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Achievements Showcase */}
            <section className="pp-achievements">
              <h2 className="pp-section-title">Achievements</h2>
              <div className="pp-achievements-grid">
                
                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #FFD700, #FDB931)" }}>
                    🏆
                  </div>
                  <span className="pp-achievement-label">Champion</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #a200ff, #ff007f)" }}>
                    🚀
                  </div>
                  <span className="pp-achievement-label">Beta Tester</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #ff4e50, #f9d423)" }}>
                    🔥
                  </div>
                  <span className="pp-achievement-label">First Blood</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #00c6ff, #0072ff)" }}>
                    ❄️
                  </div>
                  <span className="pp-achievement-label">Ice Cold</span>
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pp-footer">
          <p className="pp-copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper 
          imageSrc={imageToCrop} 
          onCropComplete={handleCropComplete} 
          onCancel={handleCropCancel} 
        />
      )}
    </div>
  );
}
