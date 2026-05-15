import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import { Search, User as UserIcon, Megaphone, Trash2, Users } from "lucide-react";
import { getToken, getAuthUser } from "../../../utils/auth";
import PlayerNavbar from "./PlayerNavbar";
import PlayerFooter from "./PlayerFooter";
import Pagination from "../../common/Pagination";
import bg from "../../../assets/home/background.png";

import "./Community.css";

type UserSearchResult = {
  _id: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
};

type TeamResult = {
  _id: string;
  name: string;
  logoUrl?: string;
  bio?: string;
  captain: {
    _id: string;
    fullName: string;
  };
  members: any[];
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
  // State for search queries and results
  const [query, setQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [joinedTeams, setJoinedTeams] = useState<TeamResult[]>([]);
  const [joinedLoading, setJoinedLoading] = useState(false);
  
  // State for team pagination
  const [teamPage, setTeamPage] = useState(1);
  const [totalTeamPages, setTotalTeamPages] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);
  
  // State for modals and form inputs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamBio, setNewTeamBio] = useState("");

  // Role-based access control
  const currentUser = getAuthUser();
  const isOrganizerOrAdmin = currentUser?.role === "organizer" || currentUser?.role === "admin";
  const isPlayer = currentUser?.role === "player";

  // Initial data fetch
  useEffect(() => {
    fetchAnnouncements();
    if (currentUser) {
      fetchJoinedTeams();
    }
  }, []);

  // Fetch teams when page changes
  useEffect(() => {
    handleSearchTeams(teamQuery.trim(), teamPage);
  }, [teamPage]);

  // Debounced player search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query.trim());
      } else {
        setUsers([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Debounced team search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setTeamPage(1);
      handleSearchTeams(teamQuery.trim(), 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [teamQuery]);

  // Fetches all notices from the server
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };
  // Searches for teams with pagination support
  const handleSearchTeams = async (q: string, page: number = 1) => {
    try {
      setTeamsLoading(true);
      const res = await api.get(`/teams?page=${page}&limit=10&search=${q}`);
      setTeams(res.data.teams || []);
      setTotalTeamPages(res.data.totalPages || 1);
      setTotalTeams(res.data.totalTeams || 0);
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchJoinedTeams = async () => {
    try {
      setJoinedLoading(true);
      const res = await api.get("/teams/my-joined-teams", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setJoinedTeams(res.data);
    } catch (err) {
      console.error("Error fetching joined teams:", err);
    } finally {
      setJoinedLoading(false);
    }
  };

  // Creates a new team record
  const handleCreateTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTeamName.trim()) return;
      try {
          await api.post("/teams", { name: newTeamName, bio: newTeamBio }, {
              headers: { Authorization: `Bearer ${getToken()}` }
          });
          setIsTeamModalOpen(false);
          setNewTeamName("");
          setNewTeamBio("");
          handleSearchTeams("");
      } catch (err: any) {
          alert(err.response?.data?.message || "Failed to create team");
      }
  };

  // Searches for players using the API
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

  // Submits a new broadcast notice
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

  // Deletes an existing notice
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

        <div className="comm-content-grid">
          
          {/* Main Column */}
          <div className="comm-main-col">
            {/* Header moved inside main or kept global? I'll keep it global above the content grid */}
            
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
                      {(currentUser?.id === notice.author?._id || currentUser?.role === "admin") && (
                        <button className="comm-notice-delete" onClick={() => handleDeleteNotice(notice._id)}>
                          <Trash2 size={20} />
                        </button>
                      )}
                      <div className="comm-notice-header">
                        {notice.author?.avatarUrl ? (
                          <img src={`http://localhost:5000${notice.author.avatarUrl}`} alt="Author" className="comm-notice-avatar" />
                        ) : (
                          <UserIcon size={24} color="#64748b" style={{background: '#1e293b', border: '1px solid #334155', borderRadius: '50%', padding: 4}} />
                        )}
                        <div>
                          <span className="comm-notice-author">{notice.author?.fullName || "System"}</span>
                          <span className="comm-notice-role">{notice.author?.role || "Announcement"}</span>
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

            {/* Teams Section */}
            <section className="comm-section">
              <div className="comm-section-header">
                <h2 className="comm-section-title">
                  <Users color="#a200ff" />
                  Active Teams {totalTeams > 0 && <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '10px', fontWeight: 'normal' }}>({totalTeams} total)</span>}
                </h2>
                {isPlayer && (
                  <button className="comm-btn" onClick={() => setIsTeamModalOpen(true)}>
                    Create Team
                  </button>
                )}
              </div>

              <form className="comm-search-bar" onSubmit={(e) => { e.preventDefault(); handleSearchTeams(teamQuery); }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search for esports teams..." 
                    value={teamQuery}
                    maxLength={50}
                    onChange={(e) => setTeamQuery(e.target.value)}
                  />
                  {teamQuery.length >= 50 && (
                    <span className="search-limit-hint">Character limit reached (50/50)</span>
                  )}
                </div>
                <button type="submit"><Search size={20} strokeWidth={1.5} /></button>
              </form>

              <div className="comm-teams-list">
                {teamsLoading ? (
                  <div className="comm-state-msg">Loading teams...</div>
                ) : teams.length === 0 ? (
                  <div className="comm-state-msg">No teams found.</div>
                ) : (
                  teams.map(team => (
                    <Link to={`/player/team/${team._id}`} key={team._id} className="team-row-card">
                      <div className="team-row-header">
                        {team.logoUrl ? (
                           <img src={`http://localhost:5000${team.logoUrl}`} alt="" className="team-avatar-small" />
                        ) : (
                           <div className="team-avatar-placeholder"><Users size={20} /></div>
                        )}
                        <div className="team-info-mini">
                          <h4 className="team-name">{team.name}</h4>
                          <span className="team-captain">Capt: {team.captain?.fullName || "None"}</span>
                        </div>
                        <div className="team-meta">
                           <span>{team.members?.length || 0} Members</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {totalTeamPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    currentPage={teamPage} 
                    totalPages={totalTeamPages} 
                    onPageChange={(p) => setTeamPage(p)} 
                  />
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className="comm-sidebar">
            {/* My Teams Section */}
            {currentUser && (
              <section className="comm-section">
                <div className="comm-section-header">
                  <h2 className="comm-section-title">
                    <Users color="#a200ff" size={20} />
                    My Teams
                  </h2>
                </div>
                <div className="sidebar-teams-list">
                  {joinedLoading ? (
                    <div className="comm-state-msg-small">Loading...</div>
                  ) : joinedTeams.length === 0 ? (
                    <div className="comm-state-msg-small">You haven't joined any teams yet.</div>
                  ) : (
                    joinedTeams.map(team => (
                      <Link to={`/player/team/${team._id}`} key={team._id} className="sidebar-team-item">
                        {team.logoUrl ? (
                          <img src={`http://localhost:5000${team.logoUrl}`} alt="" className="sidebar-team-logo" />
                        ) : (
                          <div className="sidebar-team-logo-placeholder"><Users size={14} /></div>
                        )}
                        <div className="sidebar-team-info">
                          <span className="sidebar-team-name">{team.name}</span>
                          <span className="sidebar-team-role">
                            {team.captain?._id === currentUser.id ? "Captain" : "Member"}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Player Search Section */}
            <section className="comm-section">
              <div className="comm-section-header">
                <h2 className="comm-section-title">
                  <UserIcon color="#a200ff" size={20} />
                  Find Players
                </h2>
              </div>

              <form className="comm-search-sidebar" onSubmit={onSubmitSearch}>
                <div className="search-input-wrap">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Steam-style search..." 
                    value={query}
                    maxLength={50}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query.length >= 50 && (
                    <span className="search-limit-hint-sidebar">Limit reached (50/50)</span>
                  )}
                </div>
              </form>

              <div className="search-results">
                {loading ? (
                  <div className="comm-state-msg-small">Scanning...</div>
                ) : query && users.length === 0 ? (
                  <div className="comm-state-msg-small">No players found.</div>
                ) : !query ? (
                  <div className="comm-search-placeholder">
                    <Users size={40} opacity={0.3} />
                    <p>Search for friends and rivals <br/> across the platform.</p>
                  </div>
                ) : (
                  <div className="user-results-list">
                    {users.map(user => (
                      <Link to={`/player/profile/${user._id}`} key={user._id} className="user-item">
                        {user.avatarUrl ? (
                          <img src={`http://localhost:5000${user.avatarUrl}`} alt="" className="user-avatar-tiny" />
                        ) : (
                          <div className="user-avatar-tiny-placeholder"><UserIcon size={16} /></div>
                        )}
                        <div className="user-item-info">
                          <span className="user-item-name">{user.fullName}</span>
                          <span className="user-item-role">{user.role}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>

        </div>

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

      {/* Create Team Modal */}
      {isTeamModalOpen && (
        <div className="comm-modal-overlay">
          <div className="comm-modal">
            <h2>Start your Journey</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>As a captain, you can recruit players and enter tournaments together.</p>
            <form onSubmit={handleCreateTeam}>
              <input 
                type="text" 
                placeholder="Team Name" 
                className="comm-input" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
              <textarea 
                placeholder="Team Vision / Biography" 
                className="comm-textarea"
                style={{ height: '100px' }}
                value={newTeamBio}
                onChange={(e) => setNewTeamBio(e.target.value)}
              ></textarea>
              <div className="comm-modal-actions">
                <button type="button" className="comm-btn-cancel" onClick={() => setIsTeamModalOpen(false)}>Cancel</button>
                <button type="submit" className="comm-btn">Forge Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PlayerFooter />
    </div>
  );
}
