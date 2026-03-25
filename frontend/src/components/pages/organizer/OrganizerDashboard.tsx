import "./OrganizerDashboard.css";
import { useEffect, useState } from "react";
import { clearAuthUser, getToken } from "../../../utils/auth";
import CreateTournament from "./CreateTournament";
import MyTournaments from "./MyTournaments";
import type { TournamentRow } from "./MyTournaments";
import TournamentManager from "./TournamentManager";
import OrganizerPlayers from "./OrganizerPlayers";
import OrganizerSettings from "./OrganizerSettings";
import NotificationDropdown from "./NotificationDropdown";
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Trophy, 
  DollarSign,
  TrendingUp,
  Megaphone
} from "lucide-react";

type TournamentStatus = "Live" | "Registrations Open" | "Completed" | "Draft";

const OrganizerDashboard = () => {
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "create" | "my-tournaments" | "players" | "settings" | "manage-tournament">("dashboard");
  const [managingTournament, setManagingTournament] = useState<TournamentRow | null>(null);

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalEarnings: number;
    pendingRevenue: number;
    totalPlayers: number;
    totalTournaments: number;
    trendData: Array<{ label: string; value: number }>;
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notice Broadcaster State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    try {
      const token = getToken();
      await fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: noticeTitle, content: noticeContent })
      });
      setIsNoticeModalOpen(false);
      setNoticeTitle("");
      setNoticeContent("");
      alert("Notice broadcasted to all players!");
    } catch (err) {
      console.error("Failed to post notice", err);
    }
  };

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/tournaments/organizer/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const formatted: TournamentRow[] = data.map((t: any) => ({
            id: t._id,
            name: t.title,
            game: t.game?.title || "Unknown Game",
            date: new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            status: t.status === "completed" ? "Completed" 
                  : t.status === "ongoing" ? "Live"
                  : "Registrations Open",
            participants: t.participantCount ?? 0,
            // extended fields for modal/manager
            endDate: t.endDate,
            location: t.location,
            registrationDeadline: t.registrationDeadline,
            prizePool: t.prizePool,
            description: t.description,
            maxParticipants: t.maxParticipants,
            registrationFee: t.registrationFee,
            imageUrl: t.imageUrl,
          }));
          setTournaments(formatted);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({ fullName: data.fullName, email: data.email });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/tournaments/organizer/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    if (activeView === "dashboard") {
      fetchStats();
      fetchUnreadCount();
    }
  }, [activeView]);

  const filtered = tournaments.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.game.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="od">
      {/* Sidebar */}
      <aside className="od__sidebar">
        <div className="od__brand">LOGO</div>

        <nav className="od__menu">
          <button 
            className={`od__item ${activeView === "dashboard" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <LayoutDashboard className="od__icon" size={18} /> Dashboard
          </button>
          <button 
            className={`od__item ${activeView === "create" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("create")}
          >
            <Plus className="od__icon" size={18} /> Create Tournament
          </button>
          <button 
            className={`od__item ${activeView === "my-tournaments" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("my-tournaments")}
          >
            <List className="od__icon" size={18} /> My Tournaments
          </button>
          <button 
            className={`od__item ${activeView === "players" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("players")}
          >
            <Users className="od__icon" size={18} /> Players
          </button>
          <button 
            className={`od__item ${activeView === "settings" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("settings")}
          >
            <Settings className="od__icon" size={18} /> Settings
          </button>
        </nav>

        <div className="od__sidebarFooter">
          <div className="od__profile">
            <div className="od__avatar">{profile?.fullName?.charAt(0).toUpperCase() ?? "?"}</div>
            <div>
              <div className="od__name">{profile?.fullName ?? "..."}</div>
              <div className="od__email">{profile?.email ?? "..."}</div>
            </div>
          </div>

          <button onClick={handleLogout} className="od__logout">
            <LogOut className="od__icon" size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="od__main">
        {/* Topbar — only shown on the main dashboard view */}
        {activeView === "dashboard" && (
          <header className="od__topbar">
            <div>
              <h1 className="od__title">Organizer Dashboard</h1>
              <p className="od__subtitle">Manage your events and track performance</p>
            </div>

            <div className="od__topActions">
              <div className="od__searchWrap">
                <Search className="od__searchIcon" size={18} />
                <input
                  className="od__search"
                  placeholder="Search tournaments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button className="od__bell" title="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="od__dot" />}
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </button>

              <button 
                onClick={() => setIsNoticeModalOpen(true)}
                style={{ background: 'transparent', border: '1px solid #1e293b', color: '#f8fafc', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontWeight: 600 }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#1e293b'}
              >
                <Megaphone size={18} color="#a200ff" /> 
                Broadcast Notice
              </button>

              <button className="od__primaryBtn" onClick={() => setActiveView("create")}>
                <Plus className="od__plus" size={18} /> Quick Create
              </button>
            </div>
          </header>
        )}

        {activeView === "dashboard" ? (
          <>
            {/* Stats */}
            <section className="od__stats">
              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <Trophy className="od__statIcon" size={18} /> Total Tournaments
                  </div>
                  <div className="od__ghostIcon"><Trophy size={48} /></div>
                </div>
                <div className="od__statValue">{stats?.totalTournaments ?? tournaments.length}</div>
                <div className="od__statChange">Across your history</div>
              </div>

              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <Users className="od__statIcon" size={18} /> Total Players
                  </div>
                  <div className="od__ghostIcon"><Users size={48} /></div>
                </div>
                <div className="od__statValue">{stats?.totalPlayers ?? 0}</div>
                <div className="od__statChange od__statChange--up">↗ Real-time</div>
              </div>

              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <DollarSign className="od__statIcon" size={18} /> Total Earnings
                  </div>
                  <div className="od__ghostIcon"><DollarSign size={48} /></div>
                </div>
                <div className="od__statValue">Rs. {stats?.totalEarnings?.toLocaleString() ?? "0"}</div>
                <div className="od__statChange od__statChange--up">↗ {((stats?.totalEarnings ?? 0) / (stats?.pendingRevenue || 1) * 100).toFixed(0)}% conversion</div>
              </div>
            </section>

            {/* Analytics & Table */}
            <div className="od__grid2">
              <section className="od__panel od__chartPanel">
                <div className="od__panelHead">
                  <h2 className="od__panelTitle">Registration Trends</h2>
                  <div className="od__statLabel"><TrendingUp size={14} /> Last 6 Months</div>
                </div>
                <div className="od__chartWrap">
                  {stats?.trendData ? (
                    <div className="od__svgChart">
                      {stats.trendData.map((d, i) => {
                        const maxVal = Math.max(...stats.trendData.map(v => v.value), 5);
                        const height = (d.value / maxVal) * 100;
                        return (
                          <div key={i} className="od__barGroup">
                            <div className="od__bar" style={{ height: `${height}%` }}>
                              <div className="od__barTooltip">{d.value} players</div>
                            </div>
                            <span className="od__barLabel">{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>Loading trends...</div>
                  )}
                </div>
              </section>

              <section className="od__panel">
                <div className="od__panelHead">
                  <h2 className="od__panelTitle">Recent Tournaments</h2>
                  <button className="od__linkBtn" onClick={() => setActiveView("my-tournaments")}>View All →</button>
                </div>
                <div className="od__tableWrap">
                  {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading tournaments...</div>
                  ) : (
                  <table className="od__table">
                    <thead>
                      <tr>
                        <th>TOURNAMENT</th>
                        <th>STATUS</th>
                        <th className="od__thRight">PLAYERS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 5).map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div className="od__tName">{t.name}</div>
                            <div className="od__tId">{t.game}</div>
                          </td>
                          <td>
                            <span className={`od__badge od__badge--${badgeClass(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="od__muted od__thRight">{t.participants}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={3} className="od__empty">No tournaments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : activeView === "my-tournaments" ? (
          <MyTournaments 
             tournaments={tournaments} 
             loading={loading} 
             onCreateNew={() => setActiveView("create")}
             onManage={(t) => { setManagingTournament(t); setActiveView("manage-tournament"); }}
             onDeleteSuccess={(id) => setTournaments(prev => prev.filter(t => t.id !== id))}
          />
        ) : activeView === "manage-tournament" && managingTournament ? (
          <TournamentManager
            tournament={managingTournament}
            onBack={() => setActiveView("my-tournaments")}
            onDeleted={(id) => setTournaments(prev => prev.filter(t => t.id !== id))}
          />
        ) : activeView === "players" ? (
          <OrganizerPlayers />
        ) : activeView === "settings" ? (
          <OrganizerSettings />
        ) : (
          <CreateTournament onSuccess={() => {
            setActiveView("dashboard");
            window.location.reload();
          }} />
        )}
      </main>

      {/* Notice Broadcast Modal */}
      {isNoticeModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(162,0,255,0.3)', width: '500px', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ marginTop: 0, color: '#fff', marginBottom: '24px' }}>Broadcast Official Notice</h2>
            <form onSubmit={handlePostNotice}>
              <input 
                type="text" 
                placeholder="Announcement Title" 
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
                style={{ width: '100%', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box' }}
              />
              <textarea 
                placeholder="Write your important announcement here... It will automatically be sent as a Notification to all players." 
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                required
                style={{ width: '100%', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box', resize: 'vertical', minHeight: '120px' }}
              ></textarea>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsNoticeModalOpen(false)} style={{ background: 'transparent', border: '1px solid #64748b', color: '#fff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'linear-gradient(90deg, #a200ff, #ff007f)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

function badgeClass(status: TournamentStatus) {
  switch (status) {
    case "Live":
      return "live";
    case "Registrations Open":
      return "open";
    case "Completed":
      return "done";
    case "Draft":
      return "draft";
    default:
      return "draft";
  }
}

export default OrganizerDashboard;
