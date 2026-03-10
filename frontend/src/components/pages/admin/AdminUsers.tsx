import { useState, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css"; // Reuse shared styles

type UserRole = "Player" | "Organizer" | "Admin";

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  avatarBg: string;
  avatarColor: string;
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");

  const users: UserItem[] = useMemo(() => [
    { id: "u1", fullName: "Alex Johnson", email: "alex@example.com", role: "Player", joinedDate: "Oct 12, 2023", avatarBg: "rgba(37, 99, 235, 0.15)", avatarColor: "#60a5fa" },
    { id: "u2", fullName: "Sarah Smith", email: "sarah@tournaments.com", role: "Organizer", joinedDate: "Nov 05, 2023", avatarBg: "rgba(147, 51, 234, 0.15)", avatarColor: "#c084fc" },
    { id: "u3", fullName: "System Admin", email: "admin@tourney.com", role: "Admin", joinedDate: "Jan 10, 2024", avatarBg: "rgba(234, 88, 12, 0.15)", avatarColor: "#fb923c" },
    { id: "u4", fullName: "Michael Chen", email: "mike.c@domain.com", role: "Player", joinedDate: "Feb 22, 2024", avatarBg: "rgba(37, 99, 235, 0.15)", avatarColor: "#60a5fa" },
    { id: "u5", fullName: "Elena Rodriguez", email: "elena.r@esports.net", role: "Organizer", joinedDate: "Mar 01, 2024", avatarBg: "rgba(147, 51, 234, 0.15)", avatarColor: "#c084fc" },
  ], []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "Admin": return "admin-badge--completed"; // matches green styling in css
      case "Organizer": return "admin-badge--processing"; // matches blue styling in css
      case "Player": return "admin-badge--pending-review"; // matches orange styling in css
      default: return "";
    }
  };

  return (
    <AdminLayout breadcrumb="Users" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>User Management</h1>
          <p>View and manage all registered users in the system.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary">
            <span className="admin-btn-ic">⭳</span> Export Data
          </button>
          <button className="admin-btn admin-btn--primary">
            <span className="admin-btn-ic">+</span> Add User
          </button>
        </div>
      </header>

      <section className="admin-content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <h2>All Users</h2>
            <span className="admin-td-muted">{filteredUsers.length} total</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>JOINED DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-activity-cell">
                        <div 
                          className="admin-avatar" 
                          style={{ background: u.avatarBg, color: u.avatarColor, width: 36, height: 36, fontSize: 14 }}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="admin-activity-title">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="admin-td-muted">{u.email}</td>
                    <td>
                      <span className={`admin-badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="admin-td-muted">{u.joinedDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="admin-icon-btn admin-icon-btn--outline" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} title="Edit User">
                           <span style={{ fontSize: 12 }}>✏️</span>
                        </button>
                        <button className="admin-icon-btn admin-icon-btn--no" title="Delete User">
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

export default AdminUsers;
