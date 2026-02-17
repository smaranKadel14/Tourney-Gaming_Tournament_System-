import { useMemo, useState } from "react";
import "./AdminDashboard.css";
import { clearAuthUser } from "../../../utils/auth";

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

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  // I am keeping dummy data for now (backend integration later)

  const stats = useMemo(
    () => [
      { label: "TOTAL USERS", value: "12,450", delta: "+12% vs last month", icon: "users" },
      { label: "TOTAL TOURNAMENTS", value: "85", delta: "+5% vs last month", icon: "trophy" },
      { label: "ACTIVE MATCHES", value: "12", delta: "+2% vs last hour", icon: "game" },
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

  const handleApprove = (id: string) => {
    // later: call backend API
    alert(`Approved: ${id}`);
  };

  const handleReject = (id: string) => {
    // later: call backend API
    alert(`Rejected: ${id}`);
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="brand">LOGO</div>

        <nav className="nav">
          <button className="nav-item active">
            <span className="nav-ic">▦</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span className="nav-ic">👥</span>
            Users
          </button>

          <button className="nav-item">
            <span className="nav-ic">🏆</span>
            Tournaments
          </button>

          <button className="nav-item">
            <span className="nav-ic">📄</span>
            System Logs
          </button>

          <button className="nav-item">
            <span className="nav-ic">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout">
            <span className="nav-ic">⟵</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="topbar">
          <div className="breadcrumb">Home / Dashboard</div>

          <div className="topbar-right">
            <div className="search">
              <span className="search-ic">🔎</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity..."
              />
            </div>

            <button className="btn secondary">
              <span className="btn-ic">👤+</span> Invite User
            </button>

            {/* Admin usually does not create tournament (organizer does).
                So I replaced it with Approvals shortcut. */}
            <button className="btn primary">
              <span className="btn-ic">✓</span> Approvals
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here is what’s happening today.</p>
        </header>

        {/* Stats */}
        <section className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-top">
                <div className="stat-label">{s.label}</div>
                <div className={`stat-icon ${s.icon}`}></div>
              </div>

              <div className="stat-value">{s.value}</div>
              <div className="stat-delta">
                <span className="up">↗</span> {s.delta}
              </div>
            </div>
          ))}
        </section>

        {/* Content grid */}
        <section className="grid">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-head">
              <h2>Recent Activity</h2>
              <button className="link-btn">View All</button>
            </div>

            <div className="table">
              <div className="row head">
                <div>ACTIVITY</div>
                <div>USER</div>
                <div>DATE</div>
                <div>STATUS</div>
              </div>

              {filteredActivity.map((a) => (
                <div key={a.id} className="row">
                  <div className="activity-cell">
                    <span className={`mini-ic ${a.icon}`}></span>
                    <span>{a.title}</span>
                  </div>
                  <div className="muted">{a.user}</div>
                  <div className="muted">{a.time}</div>
                  <div>
                    <span className={`pill ${a.status.replace(" ", "-").toLowerCase()}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="card approvals">
            <div className="card-head">
              <h2>Pending Approvals</h2>
            </div>

            <div className="approvals-list">
              {approvals.map((p) => (
                <div key={p.id} className="approval-item">
                  <div className="avatar">{p.name.charAt(0)}</div>
                  <div className="approval-info">
                    <div className="approval-name">{p.name}</div>
                    <div className="approval-sub">{p.subtitle}</div>
                  </div>

                  <div className="approval-actions">
                    <button className="icon-btn ok" onClick={() => handleApprove(p.id)}>
                      ✓
                    </button>
                    <button className="icon-btn no" onClick={() => handleReject(p.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn ghost">View All Pending</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
