import { useMemo, useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Users, Trophy, Gamepad2, Plus, Flag, Briefcase, ArrowRight, UserPlus } from "lucide-react";
import { getToken } from "../../../utils/auth";
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
  type: "tournament" | "user";
  email?: string;
};

const AdminDashboard = () => {
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      
      // Fetch stats
      const statsRes = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats([
          { 
            label: "TOTAL USERS", 
            value: statsData.totalUsers.toLocaleString(), 
            delta: `+${statsData.userGrowth}%`, 
            desc: "vs last month", 
            icon: "users", 
            up: statsData.userGrowth >= 0 
          },
          { 
            label: "TOTAL TOURNAMENTS", 
            value: statsData.totalTournaments.toLocaleString(), 
            delta: `+${statsData.tournamentGrowth}%`, 
            desc: "vs last month", 
            icon: "trophy", 
            up: statsData.tournamentGrowth >= 0 
          },
          { 
            label: "ACTIVE MATCHES", 
            value: statsData.activeMatches.toLocaleString(), 
            delta: "+2%", 
            desc: "vs last hour", 
            icon: "game", 
            up: true 
          },
        ]);
      }
      
      // Fetch activity
      const activityRes = await fetch("http://localhost:5000/api/admin/activity", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        const formattedActivity = activityData.map((item: any) => ({
          id: item.id,
          title: item.title,
          user: item.title.split(' ')[0] || "Unknown",
          time: new Date(item.timestamp).toLocaleString(),
          status: item.status === "completed" ? "Completed" : 
                  item.status === "pending" ? "Pending Review" : "Processing",
          icon: item.type === "registration" ? "registration" : 
                  item.type === "tournament" ? "tournament" : "organizer"
        }));
        setActivity(formattedActivity);
      }
      
      // Fetch approvals
      const approvalsRes = await fetch("http://localhost:5000/api/admin/pending-approvals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (approvalsRes.ok) {
        const approvalsData = await approvalsRes.json();
        const formattedApprovals = approvalsData.map((item: any) => ({
          id: item.id,
          name: item.organizer,
          subtitle: item.type === "tournament" ? "Tournament Verification" : "User Registration",
          type: item.type,
          email: item.email
        }));
        setApprovals(formattedApprovals);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const handleApprove = async (id: string, type: "tournament" | "user") => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/admin/approvals/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      
      if (res.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error approving item:", error);
    }
  };

  const handleReject = async (id: string, type: "tournament" | "user") => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/admin/approvals/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, reason: "Rejected by admin" })
      });
      
      if (res.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
    }
  };

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
        {loading ? (
          // Loading skeleton for stats
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="admin-stat-card">
              <div className="admin-stat-top">
                <div className="admin-stat-info">
                  <div className="admin-stat-label">Loading...</div>
                  <div className="admin-stat-value">--</div>
                </div>
                <div className="admin-stat-icon">
                  <div style={{ width: 20, height: 20, background: '#ccc', borderRadius: 4 }}></div>
                </div>
              </div>
              <div className="admin-stat-bottom">
                <div className="admin-stat-delta">--</div>
                <span className="admin-stat-desc">Loading...</span>
              </div>
            </div>
          ))
        ) : (
          stats.map((s) => (
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
          ))
        )}
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
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">Loading activity...</span>
                    </td>
                  </tr>
                ) : filteredActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No activity found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredActivity.map((a) => (
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
                  ))
                )}
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <span className="admin-td-muted">Loading approvals...</span>
              </div>
            ) : approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <span className="admin-td-muted">No pending approvals.</span>
              </div>
            ) : (
              approvals.map((p) => (
                <div key={p.id} className="admin-approval-item">
                  <div className="admin-avatar">{p.name.charAt(0)}</div>
                  <div className="admin-approval-info">
                    <div className="admin-approval-name">{p.name}</div>
                    <div className="admin-approval-sub">{p.subtitle}</div>
                  </div>
                  <div className="admin-approval-actions">
                    <button className="admin-icon-btn admin-icon-btn--ok" onClick={() => handleApprove(p.id, p.type)}>
                      ✓
                    </button>
                    <button className="admin-icon-btn admin-icon-btn--no" onClick={() => handleReject(p.id, p.type)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="admin-btn admin-btn--outline admin-btn--full">View All Pending</button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
