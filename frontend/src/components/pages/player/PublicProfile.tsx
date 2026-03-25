import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getToken } from "../../../utils/auth";
import { api } from "../../../lib/api";
import { User as UserIcon, Calendar, MapPin, Share2, UserPlus, Trophy, Target, Activity, Shield } from "lucide-react";
import PlayerNavbar from "./PlayerNavbar";
import bg from "../../../assets/home/background.png";
import valImg from "../../../assets/Tournaments/VAL.png";
import codImg from "../../../assets/Tournaments/COD.png";
import csImg from "../../../assets/Tournaments/CS.png";
import lolImg from "../../../assets/Tournaments/LOL.png";

import "./PublicProfile.css";

const getGameImage = (gameTitle?: string) => {
  if (!gameTitle) return valImg;
  const title = gameTitle.toLowerCase();
  if (title.includes("call of duty") || title.includes("cod") || title.includes("warzone")) return codImg;
  if (title.includes("counter-strike") || title.includes("cs")) return csImg;
  if (title.includes("league of legends") || title.includes("lol")) return lolImg;
  return valImg;
};

type TournamentHistory = {
  _id: string;
  title: string;
  game?: { title: string; imageUrl?: string };
  status: string;
  startDate: string;
  imageUrl?: string;
};

type PublicProfileData = {
  user: {
    _id: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
    bio?: string;
  };
  stats: {
    totalTournaments: number;
    memberSince: string;
  };
  history: TournamentHistory[];
};

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/public/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setData(res.data);
      } catch (err: any) {
        console.error("Error fetching public profile:", err);
        setError(err.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#fff' }}>Loading Profile...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pt-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2 style={{ color: '#ef4444' }}>{error || "User not found"}</h2>
        <Link to="/player/community" style={{ color: '#a200ff', textDecoration: 'none' }}>← Back to Community</Link>
      </div>
    );
  }

  const { user, stats, history } = data;

  const dateObj = new Date(stats.memberSince);
  const joinedDate = dateObj.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="pt-page">
      <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pt-overlay" />

      <div className="pt-wrap">
        <PlayerNavbar />

        <div className="pubprof-container">
          <div style={{ marginBottom: 16 }}>
            <Link to="/player/community" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              &larr; Back to Community
            </Link>
          </div>

          {/* Profile Banner */}
          <div className="pubprof-header">
            <div className="pubprof-avatar-wrap">
              {user.avatarUrl ? (
                <img src={`http://localhost:5000${user.avatarUrl}`} alt={user.fullName} className="pubprof-avatar" />
              ) : (
                <div className="pubprof-avatar-fallback">
                  <UserIcon size={64} />
                </div>
              )}
              <div className="pubprof-avatar-badge">
                <Shield size={16} color="white" fill="white" />
              </div>
            </div>

            <div className="pubprof-info">
              <div className="pubprof-name-row">
                <h1 className="pubprof-name">{user.fullName}</h1>
              </div>
              <div className="pubprof-meta">
                <div className="pubprof-meta-item">
                  <MapPin size={14} /> Global Server
                </div>
                <div className="pubprof-meta-item">
                  <Calendar size={14} /> Joined {joinedDate}
                </div>
              </div>
            </div>

            <div className="pubprof-actions">
              <button className="pubprof-btn pubprof-btn-secondary">
                <Share2 size={16} /> Share
              </button>
              <button className="pubprof-btn pubprof-btn-primary">
                <UserPlus size={16} /> Follow
              </button>
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
                  <div className="pubprof-stat-value">{stats.totalTournaments}</div>
                  <div className="pubprof-stat-sub" style={{ color: '#ffaa44' }}>Total Appearances</div>
                </div>
                
                <div className="pubprof-stat-card">
                  <Activity size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Platform Role</div>
                  <div className="pubprof-stat-value" style={{ fontSize: '24px', textTransform: 'capitalize' }}>{user.role || 'Player'}</div>
                  <div className="pubprof-stat-sub" style={{ color: '#a200ff' }}>Account Type</div>
                </div>

                <div className="pubprof-stat-card">
                  <Calendar size={60} color="#a200ff" />
                  <div className="pubprof-stat-label">Member Since</div>
                  <div className="pubprof-stat-value" style={{ fontSize: '24px' }}>
                    {dateObj.getFullYear()}
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
                  {history.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: 14 }}>No tournament history available.</div>
                  ) : (
                    history.map((tourney) => {
                      return (
                        <div className="pubprof-tourney-item" key={tourney._id}>
                          <img src={getGameImage(tourney.game?.title)} alt={tourney.game?.title} className="pubprof-tourney-icon" />
                          
                          <div className="pubprof-tourney-info">
                            <h4 className="pubprof-tourney-name">{tourney.title}</h4>
                            <div className="pubprof-tourney-meta">
                              {tourney.game?.title || "Unknown Game"}
                            </div>
                          </div>

                          <div className="pubprof-tourney-result">
                            <div className="pubprof-placement pubprof-place-other">
                              <Trophy size={10} /> PARTICIPATED
                            </div>
                            <span className="pubprof-tourney-time">{new Date(tourney.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
