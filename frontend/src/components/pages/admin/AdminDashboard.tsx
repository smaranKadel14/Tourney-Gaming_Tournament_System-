import { useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Users, Trophy, Gamepad2, Plus, Flag, Briefcase, ArrowRight, UserPlus } from "lucide-react";
import "./AdminDashboard.css";

type ActivityStatus = "Completed" | "Pending Review" | "Processing";

type ActivityItem = {
  id: string;
  title: string;
  user: string;
  time: string;
  status: ActivityStatus;
  icon: "tournament" | "dispute" | "organizer" | "registration";
};

type ApprovalItem = {
  id: string;
  name: string;
  subtitle: string;
};

const AdminDashboard = () => {
  const [search, setSearch] = useState("");

  const stats = useMemo(
    () => [
      { label: "TOTAL USERS", value: "12,450", delta: "+12%", desc: "vs last month", icon: "users", up: true },
      { label: "TOTAL TOURNAMENTS", value: "85", delta: "+5%", desc: "vs last month", icon: "trophy", up: true },
      { label: "ACTIVE MATCHES", value: "12", delta: "+2%", desc: "vs last hour", icon: "game", up: true },
    ],
    []
  );

  const activity: ActivityItem[] = useMemo(
    () => [
      { id: "a1", title: "Tournament Created", user: "Organizer_01", time: "2 mins ago", status: "Completed", icon: "tournament" },
      { id: "a2", title: "Match Dispute Reported", user: "Player_99", time: "15 mins ago", status: "Pending Review", icon: "dispute" },
      { id: "a3", title: "Organizer Application", user: "New_User_02", time: "1 hour ago", status: "Processing", icon: "organizer" },
      { id: "a4", title: "User Registration", user: "Gamer_X", time: "3 hours ago", status: "Completed", icon: "registration" },
    ],
    []
  );

  const approvals: ApprovalItem[] = useMemo(
    () => [
      { id: "p1", name: "Alex Johnson", subtitle: "Organizer Request" },
      { id: "p2", name: "Sarah Smith", subtitle: "Tournament Verification" },
    ],
    []
  );

  const filteredActivity = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activity;
    return activity.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.user.toLowerCase().includes(q) ||
        x.status.toLowerCase().includes(q)
    );
  }, [activity, search]);

  const handleApprove = (id: string) => alert(`Approved: ${id}`);
  const handleReject = (id: string) => alert(`Rejected: ${id}`);

  return (
    <AdminLayout 
      breadcrumb="Dashboard" 
      search={search} 
      onSearch={setSearch}
    >
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here is what's happening today.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary">
            <UserPlus className="admin-btn-ic" size={16} /> Invite User
          </button>
          <button className="admin-btn admin-btn--primary">
            <Plus className="admin-btn-ic" size={16} /> Create Tournament
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-top">
              <div className="admin-stat-info">
                <div className="admin-stat-label">{s.label}</div>
                <div className="admin-stat-value">{s.value}</div>
              </div>
              <div className={`admin-stat-icon admin-stat-icon--${s.icon}`}>
                 {s.icon === 'users' && <Users size={20} />}
                 {s.icon === 'trophy' && <Trophy size={20} />}
                 {s.icon === 'game' && <Gamepad2 size={20} />}
              </div>
            </div>
            <div className="admin-stat-bottom">
              <div className={`admin-stat-delta ${s.up ? 'admin-stat-delta--up' : 'admin-stat-delta--down'}`}>
                {s.up ? '↗' : '↘'} {s.delta}
              </div>
              <span className="admin-stat-desc">{s.desc}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Content Grid */}
      <section className="admin-content-grid">
        {/* Recent Activity */}
        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <h2>Recent Activity</h2>
            <button className="admin-link-btn">View All</button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ACTIVITY</th>
                  <th>USER</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="admin-activity-cell">
                        <span className={`admin-mini-ic admin-mini-ic--${a.icon}`}>
                           {a.icon === 'tournament' && <Plus size={16} />}
                           {a.icon === 'dispute' && <Flag size={16} />}
                           {a.icon === 'organizer' && <Briefcase size={16} />}
                           {a.icon === 'registration' && <ArrowRight size={16} />}
                        </span>
                        <span className="admin-activity-title">{a.title}</span>
                      </div>
                    </td>
                    <td className="admin-td-muted">{a.user}</td>
                    <td className="admin-td-muted">{a.time}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${a.status.replace(" ", "-").toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="admin-panel admin-approvals-panel">
          <div className="admin-panel-head">
            <h2>Pending Approvals</h2>
          </div>

          <div className="admin-approvals-list">
            {approvals.map((p) => (
              <div key={p.id} className="admin-approval-item">
                <div className="admin-avatar">{p.name.charAt(0)}</div>
                <div className="admin-approval-info">
                  <div className="admin-approval-name">{p.name}</div>
                  <div className="admin-approval-sub">{p.subtitle}</div>
                </div>
                <div className="admin-approval-actions">
                  <button className="admin-icon-btn admin-icon-btn--ok" onClick={() => handleApprove(p.id)}>
                    ✓
                  </button>
                  <button className="admin-icon-btn admin-icon-btn--no" onClick={() => handleReject(p.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="admin-btn admin-btn--outline admin-btn--full">View All Pending</button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
