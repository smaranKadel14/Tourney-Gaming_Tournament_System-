import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import { Search, User as UserIcon, Megaphone, Trash2 } from "lucide-react";
import { getToken, getAuthUser } from "../../../utils/auth";
import PlayerNavbar from "./PlayerNavbar";
import bg from "../../../assets/home/background.png";

import "./Community.css";

type UserSearchResult = {
  _id: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
};

type Announcement = {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
  };
  createdAt: string;
};

export default function Community() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const currentUser = getAuthUser();
  const isOrganizerOrAdmin = currentUser?.role === "organizer" || currentUser?.role === "admin";

  useEffect(() => {
    fetchAnnouncements();
    handleSearch("");
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      // Filter only players and hide the current user's own profile
      const players = res.data.filter((u: UserSearchResult) => 
        u.role === "player" && u._id !== currentUser?.id
      );
      setUsers(players);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    try {
      await api.post("/announcements", { title: noticeTitle, content: noticeContent }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setIsModalOpen(false);
      setNoticeTitle("");
      setNoticeContent("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to post notice", err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if(!window.confirm("Are you sure you want to pull down this notice?")) return;
    try {
      await api.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete notice", err);
    }
  };

  return (
    <div className="pt-page">
      <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pt-overlay" />

      <div className="pt-wrap">
        <PlayerNavbar />

        <div className="comm-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
          
          {/* Header */}
          <header className="comm-header">
            <h1>Community Hub</h1>
            <p>The central hub for all players, news, and official tournament notices.</p>
          </header>

          {/* Notice Board Section */}
          <section className="comm-section">
            <div className="comm-section-header">
              <h2 className="comm-section-title">
                <Megaphone color="#a200ff" />
                Notice Board
              </h2>
              {isOrganizerOrAdmin && (
                <button className="comm-btn" onClick={() => setIsModalOpen(true)}>
                  + Broadcast Notice
                </button>
              )}
            </div>

            <div className="comm-notices">
              {announcements.length === 0 ? (
                <div className="comm-state-msg">No notices have been published yet.</div>
              ) : (
                announcements.map((notice) => (
                  <div className="comm-notice-card" key={notice._id}>
                    {(currentUser?.id === notice.author._id || currentUser?.role === "admin") && (
                      <button className="comm-notice-delete" onClick={() => handleDeleteNotice(notice._id)}>
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="comm-notice-header">
                      {notice.author.avatarUrl ? (
                        <img src={`http://localhost:5000${notice.author.avatarUrl}`} alt="Author" className="comm-notice-avatar" />
                      ) : (
                        <UserIcon size={24} color="#64748b" style={{background: '#1e293b', border: '1px solid #334155', borderRadius: '50%', padding: 4}} />
                      )}
                      <div>
                        <span className="comm-notice-author">{notice.author.fullName}</span>
                        <span className="comm-notice-role">{notice.author.role}</span>
                      </div>
                      <span className="comm-notice-date">{new Date(notice.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="comm-notice-title">{notice.title}</h3>
                    <p className="comm-notice-content">{notice.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Player Search Section */}
          <section className="comm-section">
            <div className="comm-section-header">
              <h2 className="comm-section-title">
                <UserIcon color="#a200ff" />
                Player Search
              </h2>
            </div>

            <form className="comm-search-bar" onSubmit={onSubmitSearch}>
              <input 
                type="text" 
                placeholder="Search for players across Tourney..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit"><Search size={20} strokeWidth={1.5} /></button>
            </form>

            {loading ? (
              <div className="comm-state-msg">Scanning for players...</div>
            ) : users.length === 0 ? (
              <div className="comm-state-msg">No players found matching your query.</div>
            ) : (
              <div className="comm-grid">
                {users.map(user => (
                  <Link to={`/player/profile/${user._id}`} key={user._id} className="comm-card">
                    <div className="comm-card-header">
                      {user.avatarUrl ? (
                        <img src={`http://localhost:5000${user.avatarUrl}`} alt={user.fullName} className="comm-avatar" />
                      ) : (
                        <div className="comm-avatar-placeholder"><UserIcon size={24} /></div>
                      )}
                      <div className="comm-user-info">
                        <h3 className="comm-user-name">{user.fullName}</h3>
                        <span className="comm-user-role">{user.role}</span>
                      </div>
                    </div>
                    
                    <div className="comm-card-body">
                      <p>{user.bio || "No description provided. Letting their stats do the talking."}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Organizer Post Modal */}
      {isModalOpen && (
        <div className="comm-modal-overlay">
          <div className="comm-modal">
            <h2>Broadcast Official Notice</h2>
            <form onSubmit={handlePostNotice}>
              <input 
                type="text" 
                placeholder="Announcement Title" 
                className="comm-input" 
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
              />
              <textarea 
                placeholder="Write your important announcement here... It will be visible globally to all players." 
                className="comm-textarea"
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                required
              ></textarea>
              <div className="comm-modal-actions">
                <button type="button" className="comm-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="comm-btn">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
