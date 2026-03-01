import "./OrganizerDashboard.css";
import { useEffect, useState } from "react";
import { clearAuthUser, getToken } from "../../../utils/auth";
import CreateTournament from "./CreateTournament";

type TournamentStatus = "Live" | "Registrations Open" | "Completed" | "Draft";

type TournamentRow = {
  id: string;
  name: string;
  game: string;
  date: string;
  status: TournamentStatus;
  participants: string; // keep as string for now (dummy)
};

const OrganizerDashboard = () => {
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "create">("dashboard");

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);

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
          const formatted = data.map((t: any) => ({
            id: t._id,
            name: t.title,
            game: t.game?.title || "Unknown Game",
            date: new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            status: t.status === "completed" ? "Completed" 
                  : t.status === "ongoing" ? "Live"
                  : "Registrations Open",
            participants: "—",
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
            <span className="od__icon">▦</span> Dashboard
          </button>
          <button 
            className={`od__item ${activeView === "create" ? "od__item--active" : ""}`}
            onClick={() => setActiveView("create")}
          >
            <span className="od__icon">＋</span> Create Tournament
          </button>
          <button className="od__item">
            <span className="od__icon">≡</span> My Tournaments
          </button>
          <button className="od__item">
            <span className="od__icon">👥</span> Players
          </button>
          <button className="od__item">
            <span className="od__icon">⚙</span> Settings
          </button>
        </nav>

        <div className="od__sidebarFooter">
          <div className="od__profile">
            <div className="od__avatar">A</div>
            <div>
              <div className="od__name">Alex Morgan</div>
              <div className="od__email">alex@gameframe.io</div>
            </div>
          </div>

          <button onClick={handleLogout} className="od__logout">
            <span className="od__icon">⎋</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="od__main">
        {/* Topbar */}
        <header className="od__topbar">
          <div>
            <h1 className="od__title">Organizer Dashboard</h1>
            <p className="od__subtitle">Manage your events and track performance</p>
          </div>

          <div className="od__topActions">
            <div className="od__searchWrap">
              <span className="od__searchIcon">🔍</span>
              <input
                className="od__search"
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="od__bell" title="Notifications">
              🔔
              <span className="od__dot" />
            </button>

            <button className="od__primaryBtn" onClick={() => setActiveView("create")}>
              <span className="od__plus">＋</span> Quick Create
            </button>
          </div>
        </header>

        {activeView === "dashboard" ? (
          <>
            {/* Stats */}
            <section className="od__stats">
              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <span className="od__statIcon">🏆</span> Total Tournaments
                  </div>
                  <div className="od__ghostIcon">🏆</div>
                </div>
                <div className="od__statValue">{tournaments.length}</div>
                <div className="od__statChange od__statChange--up">↗ Dynamic</div>
              </div>

              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <span className="od__statIcon">▶</span> Active Tournaments
                  </div>
                  <div className="od__ghostIcon">▶</div>
                </div>
                <div className="od__statValue">{tournaments.filter(t => t.status === "Live" || t.status === "Registrations Open").length}</div>
                <div className="od__statChange od__statChange--up">↗ Dynamic</div>
              </div>

              <div className="od__statCard">
                <div className="od__statTop">
                  <div className="od__statLabel">
                    <span className="od__statIcon">👥</span> Registered Players
                  </div>
                  <div className="od__ghostIcon">👥</div>
                </div>
                <div className="od__statValue">0</div>
                <div className="od__statChange od__statChange--up">↗ Dynamic</div>
              </div>
            </section>

            {/* Table */}
            <section className="od__panel">
              <div className="od__panelHead">
                <h2 className="od__panelTitle">Recent Tournaments</h2>
                <button className="od__linkBtn">View All →</button>
              </div>

              <div className="od__tableWrap">
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading tournaments...</div>
                ) : (
                <table className="od__table">
                  <thead>
                    <tr>
                      <th>TOURNAMENT NAME</th>
                      <th>GAME</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th>PARTICIPANTS</th>
                      <th className="od__thRight">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="od__tName">{t.name}</div>
                          <div className="od__tId">ID: #{t.id}</div>
                        </td>
                        <td className="od__muted">{t.game}</td>
                        <td className="od__muted">{t.date}</td>
                        <td>
                          <span className={`od__badge od__badge--${badgeClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="od__muted">{t.participants}</td>
                        <td className="od__actions">
                          <button className="od__dots" title="More">⋮</button>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="od__empty">
                          No tournaments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                )}
              </div>

              <div className="od__tableFooter">
                <div className="od__mutedSmall">
                  Showing {Math.min(filtered.length, 4)} of {tournaments.length} tournaments
                </div>
                <div className="od__pager">
                  <button className="od__pagerBtn" disabled>
                    Previous
                  </button>
                  <button className="od__pagerBtn">Next</button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <CreateTournament onSuccess={() => {
            setActiveView("dashboard");
            window.location.reload();
          }} />
        )}
      </main>
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
