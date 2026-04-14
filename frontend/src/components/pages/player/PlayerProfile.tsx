import { useState, useEffect, useRef } from "react";
import { api, BASE_URL } from "../../../lib/api";
import PlayerNavbar from "./PlayerNavbar";
import { getToken } from "../../../utils/auth";
import ImageCropper from "../../common/ImageCropper";
import { User as UserIcon, Calendar, MapPin, Share2, Trophy, Target, Activity, Camera, Trash2, Edit2, Save, X } from "lucide-react";
import bg from "../../../assets/home/background.png";
import valImg from "../../../assets/Tournaments/VAL.png";
import codImg from "../../../assets/Tournaments/COD.png";

import "./PublicProfile.css"; // Reuse the stunning unified CSS

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  role: string;
  updatedAt: string;
  history?: TournamentHistory[];
  stats?: {
    totalTournaments: number;
    memberSince: string;
  };
}

type TournamentHistory = {
  _id: string;
  title: string;
  game?: { title: string; imageUrl?: string };
  status: string;
  startDate: string;
  imageUrl?: string;
};

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
      const res = await api.get("/users/profile", {
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
      const res = await api.put(
        "/users/profile",
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
      e.target.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

    try {
      await api.post("/users/avatar", formData, {
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
      const res = await api.put(
        "/users/profile",
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

  if (!profile) return (
    <div className="pt-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#fff' }}>Loading Profile...</h2>
    </div>
  );

  return (
    <div className="pt-page">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: "none" }} 
        accept="image/jpeg, image/png, image/jpg, image/webp" 
        onChange={handleFileChange} 
      />

      <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pt-overlay" />

      <div className="pt-wrap">
        <PlayerNavbar />

        <div className="pubprof-container">
          
          {/* Profile Banner */}
          <div className="pubprof-header">
            <div className="pubprof-avatar-wrap">
              {profile.avatarUrl ? (
                <img 
                  src={`${BASE_URL}${profile.avatarUrl}?t=${new Date(profile.updatedAt).getTime()}`} 
                  alt={profile.fullName} 
                  className="pubprof-avatar" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement?.classList.add("fallback-active");
                  }}
                />
              ) : null}
              
              <div className="pubprof-avatar-fallback avatar-placeholder" style={{ display: profile.avatarUrl ? 'none' : 'flex' }}>
                <UserIcon size={64} />
              </div>

              {/* Edit Avatar Overlay */}
              <div className="avatar-edit-overlay">
                <button className="avatar-action-btn" onClick={handleUploadAvatar} title="Change Avatar">
                  <Camera size={20} />
                </button>
                {profile.avatarUrl && (
                  <button className="avatar-action-btn danger" onClick={handleRemoveAvatar} title="Remove Avatar">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="pubprof-info">
              {isEditing ? (
                <div style={{ marginBottom: 12 }}>
                  <input 
                    type="text" 
                    className="edit-input" 
                    value={editForm.fullName} 
                    onChange={e => setEditForm(prev => ({...prev, fullName: e.target.value}))}
                  />
                  <textarea 
                    className="edit-textarea" 
                    value={editForm.bio} 
                    placeholder="Write your bio..."
                    onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                  />
                </div>
              ) : (
                <>
                  <div className="pubprof-name-row">
                    <h1 className="pubprof-name">{profile.fullName}</h1>
                  </div>
                  <div className="pubprof-meta" style={{ marginBottom: 8 }}>
                    <div className="pubprof-meta-item">
                      <MapPin size={14} /> {profile.email}
                    </div>
                    <div className="pubprof-meta-item">
                      <Calendar size={14} /> Platform Member
                    </div>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: 14 }}>
                    {profile.bio || "Click 'Edit Profile' to add a custom biography."}
                  </div>
                </>
              )}
            </div>

            <div className="pubprof-actions">
              {isEditing ? (
                <>
                  <button className="pubprof-btn pubprof-btn-secondary" onClick={() => setIsEditing(false)}>
                    <X size={16} /> Cancel
                  </button>
                  <button className="pubprof-btn pubprof-btn-primary" onClick={handleSaveProfile}>
                    <Save size={16} /> Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button className="pubprof-btn pubprof-btn-secondary">
                    <Share2 size={16} /> Share
                  </button>
                  <button className="pubprof-btn pubprof-btn-primary" onClick={() => setIsEditing(true)}>
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pubprof-body">
            {/* Left Column (Full Width Now) */}
            <div className="pubprof-left" style={{ gridColumn: '1 / -1' }}>
              
              {/* Real Stats Row */}
              <div className="pubprof-stats-row">
                <div className="pubprof-stat-card">
                  <Target size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Tournaments Played</div>
                  <div className="pubprof-stat-value">{profile.stats?.totalTournaments || 0}</div>
                  <div className="pubprof-stat-sub" style={{ color: '#ffaa44' }}>Total Appearances</div>
                </div>
                
                <div className="pubprof-stat-card">
                  <Activity size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Platform Role</div>
                  <div className="pubprof-stat-value" style={{ fontSize: '24px', textTransform: 'capitalize' }}>{profile.role || 'Player'}</div>
                  <div className="pubprof-stat-sub" style={{ color: '#a200ff' }}>Account Type</div>
                </div>

                <div className="pubprof-stat-card">
                  <Calendar size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Member Since</div>
                  <div className="pubprof-stat-value" style={{ fontSize: '24px' }}>
                    {profile.stats?.memberSince ? new Date(profile.stats.memberSince).getFullYear() : new Date().getFullYear()}
                  </div>
                  <div className="pubprof-stat-sub" style={{ color: '#94a3b8' }}>Join Date</div>
                </div>

                <div className="pubprof-stat-card">
                  <Trophy size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Trophies</div>
                  <div className="pubprof-stat-value">0</div>
                  <div className="pubprof-stat-sub" style={{ color: '#94a3b8' }}>Coming Soon</div>
                </div>
              </div>

              {/* Tournament History */}
              <div className="pubprof-panel">
                <div className="pubprof-panel-header">
                  <h2 className="pubprof-panel-title">Tournament History</h2>
                </div>

                <div className="pubprof-tourney-list">
                  {!profile.history || profile.history.length === 0 ? (
                    <div style={{ color: '#64748b' }}>You haven't participated in any completed tournaments yet.</div>
                  ) : (
                    profile.history.map(tourney => (
                      <div className="pubprof-tourney-item" key={tourney._id}>
                        <img src={tourney.game?.title?.toLowerCase().includes('valorant') ? valImg : codImg} alt={tourney.game?.title || "Game"} className="pubprof-tourney-icon" />
                        <div className="pubprof-tourney-info">
                          <h4 className="pubprof-tourney-name">{tourney.title}</h4>
                          <div className="pubprof-tourney-meta">{tourney.game?.title || "Unknown Game"}</div>
                        </div>
                        <div className="pubprof-tourney-result">
                          <div className="pubprof-placement pubprof-place-other">
                            <Trophy size={10} /> PARTICIPATED
                          </div>
                          <span className="pubprof-tourney-time">{new Date(tourney.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

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
