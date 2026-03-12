import { useState, useEffect } from "react";
import { ArrowLeft, Edit3, Users, AlertTriangle, Save, Trash2, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./TournamentManager.css";

interface TournamentRow {
  id: string;
  name: string;
  game: string;
  date: string;
  status: string;
  participants: number;
  endDate?: string;
  location?: string;
  registrationDeadline?: string;
  prizePool?: string;
  description?: string;
  maxParticipants?: number;
  registrationFee?: number;
  imageUrl?: string;
}

interface Registration {
  _id: string;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

interface Props {
  tournament: TournamentRow;
  onBack: () => void;
  onDeleted: (id: string) => void;
}

type Tab = "details" | "participants" | "danger";

const TournamentManager = ({ tournament, onBack, onDeleted }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  // --- Details tab state ---
  const [form, setForm] = useState({
    title: tournament.name,
    description: tournament.description || "",
    location: tournament.location || "",
    prizePool: tournament.prizePool || "",
    maxParticipants: tournament.maxParticipants ?? 0,
    registrationFee: tournament.registrationFee ?? 0,
    status: tournament.status === "Live" ? "ongoing"
          : tournament.status === "Completed" ? "completed"
          : "upcoming",
    imageUrl: tournament.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Participants tab state ---
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // --- Danger zone state ---
  const [deleting, setDeleting] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (activeTab === "participants") {
      fetchRegistrations();
    }
  }, [activeTab]);

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRegistrations(await res.json());
    } catch (e) {
      console.error("Error fetching registrations", e);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaveMsg({ type: "success", text: "Changes saved successfully." });
      } else {
        const d = await res.json();
        setSaveMsg({ type: "error", text: d.message || "Failed to save." });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Server error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${tournament.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDeleted(tournament.id);
        onBack();
      } else {
        const d = await res.json();
        alert(d.message || "Failed to delete.");
      }
    } catch {
      alert("Server error. Could not delete.");
    } finally {
      setDeleting(false);
    }
  };

  const regStatusIcon = (s: string) => {
    if (s === "confirmed") return <CheckCircle size={14} className="tm-reg-icon tm-reg-icon--confirmed" />;
    if (s === "cancelled" || s === "rejected") return <XCircle size={14} className="tm-reg-icon tm-reg-icon--cancelled" />;
    return <Clock size={14} className="tm-reg-icon tm-reg-icon--pending" />;
  };

  return (
    <div className="tm-container animate-fade-in">
      {/* Header */}
      <div className="tm-header">
        <div className="tm-header-left">
          <button className="tm-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back to My Tournaments
          </button>
          <h2 className="tm-title">{tournament.name}</h2>
          <p className="tm-subtitle">{tournament.game} · {tournament.date}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tm-tabs">
        <button
          className={`tm-tab ${activeTab === "details" ? "tm-tab--active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <Edit3 size={15} /> Details
        </button>
        <button
          className={`tm-tab ${activeTab === "participants" ? "tm-tab--active" : ""}`}
          onClick={() => setActiveTab("participants")}
        >
          <Users size={15} /> Participants <span className="tm-tab-count">{registrations.length || tournament.participants}</span>
        </button>
        <button
          className={`tm-tab tm-tab--danger ${activeTab === "danger" ? "tm-tab--active tm-tab--danger-active" : ""}`}
          onClick={() => setActiveTab("danger")}
        >
          <AlertTriangle size={15} /> Danger Zone
        </button>
      </div>

      {/* --- Details Tab --- */}
      {activeTab === "details" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">Edit tournament details. Click Save to apply changes.</div>

          {saveMsg && (
            <div className={`tm-alert tm-alert--${saveMsg.type}`}>{saveMsg.text}</div>
          )}

          <div className="tm-form-grid">
            <div className="tm-form-group">
              <label>Tournament Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="tm-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="upcoming">Upcoming (Registrations Open)</option>
                <option value="ongoing">Ongoing (Live)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="tm-form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>

            <div className="tm-form-group">
              <label>Prize Pool</label>
              <input value={form.prizePool} onChange={e => setForm(p => ({ ...p, prizePool: e.target.value }))} placeholder="e.g. $500, TBA" />
            </div>

            <div className="tm-form-group">
              <label>Max Participants <span className="tm-hint">(0 = unlimited)</span></label>
              <input type="number" min={0} value={form.maxParticipants} onChange={e => setForm(p => ({ ...p, maxParticipants: Number(e.target.value) }))} />
            </div>

            <div className="tm-form-group">
              <label>Registration Fee <span className="tm-hint">(Rs.)</span></label>
              <input type="number" min={0} value={form.registrationFee} onChange={e => setForm(p => ({ ...p, registrationFee: Number(e.target.value) }))} />
            </div>

            <div className="tm-form-group tm-full-width">
              <label>Banner Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="tm-form-group tm-full-width">
              <label>Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="tm-form-actions">
            <button className="tm-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="tm-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* --- Participants Tab --- */}
      {activeTab === "participants" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-section-desc">All players registered for this tournament.</div>

          {loadingRegs ? (
            <div className="tm-empty">
              <div className="mt-loader" />
              <p>Loading participants...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="tm-empty">
              <Users size={40} opacity={0.3} />
              <p>No registrations yet.</p>
            </div>
          ) : (
            <div className="tm-reg-table-wrap">
              <table className="tm-reg-table">
                <thead>
                  <tr>
                    <th>PLAYER</th>
                    <th>EMAIL</th>
                    <th>REGISTERED</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="tm-player-cell">
                          <div className="tm-player-avatar">
                            {r.user?.avatarUrl
                              ? <img src={`http://localhost:5000${r.user.avatarUrl}`} alt="" />
                              : <span>{r.user?.fullName?.charAt(0) ?? "?"}</span>
                            }
                          </div>
                          <span className="tm-player-name">{r.user?.fullName ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="tm-muted">{r.user?.email}</td>
                      <td className="tm-muted">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`tm-badge tm-badge--${r.status}`}>
                          {regStatusIcon(r.status)} {r.status}
                        </span>
                      </td>
                      <td>
                        <span className={`tm-badge tm-badge--${r.paymentStatus}`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Danger Zone Tab --- */}
      {activeTab === "danger" && (
        <div className="tm-panel animate-fade-in">
          <div className="tm-danger-card">
            <div className="tm-danger-icon"><AlertTriangle size={24} /></div>
            <div className="tm-danger-body">
              <div className="tm-danger-title">Delete Tournament</div>
              <div className="tm-danger-desc">
                This will permanently delete <strong>"{tournament.name}"</strong> and all its registrations. This action cannot be undone.
              </div>
            </div>
            <button className="tm-delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="tm-spin" /> : <Trash2 size={16} />}
              {deleting ? "Deleting..." : "Delete Tournament"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManager;
