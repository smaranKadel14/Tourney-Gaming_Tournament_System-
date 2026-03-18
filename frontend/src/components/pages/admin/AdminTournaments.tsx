import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { Download, Plus, Edit2, X, Gamepad2, Trophy, Check } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./AdminDashboard.css"; // Reuse shared styling

type TournamentStatus = "pending" | "upcoming" | "ongoing" | "completed" | "rejected";

type TournamentItem = {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  status: TournamentStatus;
  gameIcon: React.ReactNode;
  gameColor: string;
  raw: any;
};

const AdminTournaments = () => {
  const [search, setSearch] = useState("");
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<TournamentStatus>("upcoming");

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
          status: t.status as TournamentStatus,
          gameIcon: t.game?.title?.includes("Soccer") ? <Gamepad2 size={24} /> : <Trophy size={24} />,
          gameColor: "#fb923c",
          raw: t
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
      case "pending": return "admin-badge--pending-review"; // amber style
      case "rejected": return "admin-badge--error"; // red style
      default: return "";
    }
  };

  const formatStatusText = (status: TournamentStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStartEdit = (t: TournamentItem) => {
    setEditingId(t.id);
    setEditStatus(t.status);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/tournaments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: editStatus })
      });

      if (res.ok) {
        setTournaments(prev => prev.map(t => {
          if (t.id === id) {
            return { ...t, status: editStatus };
          }
          return t;
        }));
        setEditingId(null);
      } else {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating tournament status:", error);
      alert("Server error. Could not update status.");
    }
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

  const handleExportData = () => {
    if (tournaments.length === 0) return;
    
    // Create CSV content
    const headers = ["ID", "Title", "Organizer", "Start Date", "Status", "Max Participants"];
    const csvRows = [headers.join(",")];
    
    tournaments.forEach(t => {
      const values = [
        t.id, 
        `"${t.title.replace(/"/g, '""')}"`, 
        `"${t.organizer.replace(/"/g, '""')}"`, 
        `"${t.startDate}"`, 
        t.status,
        t.raw?.maxParticipants || 0
      ];
      csvRows.push(values.join(","));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tournaments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTournament = () => {
    alert("Navigating to Tournament Creation Form...");
    // Future integration: navigate("/organizer/tournaments/new")
  };

  return (
    <AdminLayout breadcrumb="Tournaments" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Tournament Management</h1>
          <p>View, modify, and oversee all tournaments on the platform.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary" onClick={handleExportData}>
            <Download className="admin-btn-ic" size={16} /> Export Data
          </button>
          <button className="admin-btn admin-btn--primary" onClick={handleCreateTournament}>
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
                      {editingId === t.id ? (
                        <select 
                          className="admin-search-input" 
                          style={{ width: '110px', padding: '4px 8px' }}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as TournamentStatus)}
                        >
                          <option value="pending">Pending</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={`admin-badge ${getStatusBadgeClass(t.status)}`}>
                          {formatStatusText(t.status)}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                        {editingId === t.id ? (
                          <>
                            <button className="admin-icon-btn admin-icon-btn--ok" title="Save Status" onClick={() => handleSaveEdit(t.id)}>
                              <Check size={14} />
                            </button>
                            <button className="admin-icon-btn admin-icon-btn--no" title="Cancel Edit" onClick={() => setEditingId(null)}>
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="admin-icon-btn admin-icon-btn--outline" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} title="Edit Status" onClick={() => handleStartEdit(t)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="admin-icon-btn admin-icon-btn--no" title="Delete" onClick={() => handleDelete(t.id, t.title)}>
                              <X size={14} />
                            </button>
                          </>
                        )}
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
