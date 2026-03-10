import { useState, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css"; // Reuse shared styling

type TournamentStatus = "upcoming" | "ongoing" | "completed";

type TournamentItem = {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  status: TournamentStatus;
  gameIcon: string;
  gameColor: string;
};

const AdminTournaments = () => {
  const [search, setSearch] = useState("");

  const tournaments: TournamentItem[] = useMemo(() => [
    { id: "t1", title: "Summer Championship 2024", organizer: "EpicEvents LLC", startDate: "Jun 15, 2024", status: "upcoming", gameIcon: "🎮", gameColor: "#fb923c" },
    { id: "t2", title: "Weekly Pro League", organizer: "Sarah Smith", startDate: "Mar 01, 2024", status: "ongoing", gameIcon: "🏆", gameColor: "#c084fc" },
    { id: "t3", title: "Winter Invitational", organizer: "Alex Johnson", startDate: "Dec 10, 2023", status: "completed", gameIcon: "🥶", gameColor: "#60a5fa" },
    { id: "t4", title: "Amateur Qualifier #3", organizer: "Gaming Hub", startDate: "Aug 05, 2024", status: "upcoming", gameIcon: "🎯", gameColor: "#ef4444" },
    { id: "t5", title: "Regional Finals", organizer: "EpicEvents LLC", startDate: "Jan 15, 2024", status: "completed", gameIcon: "🌟", gameColor: "#fbbf24" },
  ], []);

  const filteredTournaments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tournaments;
    return tournaments.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.organizer.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }, [tournaments, search]);

  const getStatusBadgeClass = (status: TournamentStatus) => {
    switch (status) {
      case "completed": return "admin-badge--pending-review"; // grey/amber style
      case "ongoing": return "admin-badge--completed"; // green (live) style
      case "upcoming": return "admin-badge--processing"; // blue style
      default: return "";
    }
  };

  const formatStatusText = (status: TournamentStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <AdminLayout breadcrumb="Tournaments" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Tournament Management</h1>
          <p>View, modify, and oversee all tournaments on the platform.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary">
            <span className="admin-btn-ic">⭳</span> Export Data
          </button>
          <button className="admin-btn admin-btn--primary">
            <span className="admin-btn-ic">+</span> Create Tournament
          </button>
        </div>
      </header>

      <section className="admin-content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <h2>All Tournaments</h2>
            <span className="admin-td-muted">{filteredTournaments.length} active</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TOURNAMENT</th>
                  <th>ORGANIZER</th>
                  <th>START DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTournaments.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="admin-activity-cell">
                        <div 
                          className="admin-avatar" 
                          style={{ 
                            background: `color-mix(in srgb, ${t.gameColor} 15%, transparent)`, 
                            color: t.gameColor, 
                            width: 40, height: 40, fontSize: 18, borderRadius: 8
                          }}
                        >
                          {t.gameIcon}
                        </div>
                        <span className="admin-activity-title" style={{ fontWeight: 600 }}>{t.title}</span>
                      </div>
                    </td>
                    <td className="admin-td-muted">{t.organizer}</td>
                    <td className="admin-td-muted">{t.startDate}</td>
                    <td>
                      <span className={`admin-badge ${getStatusBadgeClass(t.status)}`}>
                        {formatStatusText(t.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="admin-icon-btn admin-icon-btn--outline" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} title="Edit">
                           <span style={{ fontSize: 12 }}>✏️</span>
                        </button>
                        <button className="admin-icon-btn admin-icon-btn--no" title="Delete">
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminTournaments;
