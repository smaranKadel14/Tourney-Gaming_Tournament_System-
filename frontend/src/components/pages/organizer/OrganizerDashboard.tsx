import "./OrganizerDashboard.css";
import { useMemo, useState } from "react";
import { clearAuthUser } from "../../../utils/auth";

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

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  // Dummy data (later: from backend)
  const tournaments: TournamentRow[] = useMemo(
    () => [
      {
        id: "TR-8832",
        name: "Neon City Showdown",
        game: "Valorant",
        date: "Oct 24, 2023",
        status: "Live",
        participants: "42",
      },
      {
        id: "TR-9921",
        name: "Apex Legends: Winter Cup",
        game: "Apex Legends",
        date: "Nov 02, 2023",
        status: "Registrations Open",
        participants: "120",
      },
      {
        id: "TR-7712",
        name: "Weekend Warriors",
        game: "CS:GO",
        date: "Oct 20, 2023",
        status: "Completed",
        participants: "64",
      },
      {
        id: "TR-4402",
        name: "Rocket League Pro Series",
        game: "Rocket League",
        date: "Nov 15, 2023",
        status: "Draft",
        participants: "—",
      },
    ],
    []
  );

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
          <button className="od__item od__item--active">
            <span className="od__icon">▦</span> Dashboard
          </button>
          <button className="od__item">
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

            <button className="od__primaryBtn">
              <span className="od__plus">＋</span> Quick Create
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="od__stats">
          <div className="od__statCard">
            <div className="od__statTop">
              <div className="od__statLabel">
                <span className="od__statIcon">🏆</span> Total Tournaments
              </div>
              <div className="od__ghostIcon">🏆</div>
            </div>
            <div className="od__statValue">12</div>
            <div className="od__statChange od__statChange--up">↗ +2% this month</div>
          </div>

          <div className="od__statCard">
            <div className="od__statTop">
              <div className="od__statLabel">
                <span className="od__statIcon">▶</span> Active Tournaments
              </div>
              <div className="od__ghostIcon">▶</div>
            </div>
            <div className="od__statValue">3</div>
            <div className="od__statChange od__statChange--up">↗ 1 starting today</div>
          </div>

          <div className="od__statCard">
            <div className="od__statTop">
              <div className="od__statLabel">
                <span className="od__statIcon">👥</span> Registered Players
              </div>
              <div className="od__ghostIcon">👥</div>
            </div>
            <div className="od__statValue">1,250</div>
            <div className="od__statChange od__statChange--up">↗ +15% vs last week</div>
          </div>
        </section>

        {/* Table */}
        <section className="od__panel">
          <div className="od__panelHead">
            <h2 className="od__panelTitle">Recent Tournaments</h2>
            <button className="od__linkBtn">View All →</button>
          </div>

          <div className="od__tableWrap">
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
