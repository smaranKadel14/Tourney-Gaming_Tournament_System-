import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { Download, Plus, Edit2, X, Gamepad2, Trophy } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./AdminDashboard.css"; // Reuse shared styling

type TournamentStatus = "upcoming" | "ongoing" | "completed";

type TournamentItem = {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  status: TournamentStatus;
  gameIcon: React.ReactNode;
  gameColor: string;
};

const AdminTournaments = () => {
  const [search, setSearch] = useState("");
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tournaments on mount
  const fetchTournaments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tournaments");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((t: any) => ({
          id: t._id,
          title: t.title,
          organizer: t.organizer?.name || "Unknown",
          startDate: new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          status: t.status === "completed" ? "completed" : t.status === "ongoing" ? "ongoing" : "upcoming",
          gameIcon: t.game?.title.includes("Soccer") ? <Gamepad2 size={24} /> : <Trophy size={24} />,
          gameColor: "#fb923c"
        }));
        setTournaments(formatted);
      }
    } catch (error) {
      console.error("Error fetching admin tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete ${title}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/tournaments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Remove from state
        setTournaments(prev => prev.filter(t => t.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
      alert("Server error. Could not delete tournament.");
    }
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
            <Download className="admin-btn-ic" size={16} /> Export Data
          </button>
          <button className="admin-btn admin-btn--primary">
            <Plus className="admin-btn-ic" size={16} /> Create Tournament
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
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">Loading tournaments...</span>
                    </td>
                  </tr>
                ) : filteredTournaments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No tournaments found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredTournaments.map((t) => (
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
                           <Edit2 size={14} />
                        </button>
                        <button className="admin-icon-btn admin-icon-btn--no" title="Delete" onClick={() => handleDelete(t.id, t.title)}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminTournaments;
