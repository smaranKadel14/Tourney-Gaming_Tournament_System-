import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { Download, Plus, Edit2, X, Check } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./AdminDashboard.css";

type UserRole = "player" | "organizer" | "admin";

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
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("player");

  // Colors for avatars based on role
  const getAvatarStyle = (role: UserRole) => {
    switch (role) {
      case "admin": return { bg: "rgba(234, 88, 12, 0.15)", color: "#fb923c" };
      case "organizer": return { bg: "rgba(147, 51, 234, 0.15)", color: "#c084fc" };
      default: return { bg: "rgba(37, 99, 235, 0.15)", color: "#60a5fa" };
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((u: any) => {
          const style = getAvatarStyle(u.role);
          return {
            id: u._id,
            fullName: u.fullName || "Unknown",
            email: u.email,
            role: u.role,
            joinedDate: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            avatarBg: style.bg,
            avatarColor: style.color
          };
        });
        setUsers(formatted);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "admin-badge--completed"; 
      case "organizer": return "admin-badge--processing"; 
      case "player": return "admin-badge--pending-review"; 
      default: return "";
    }
  };

  const formatRoleText = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Server error. Could not delete user.");
    }
  };

  const handleStartEdit = (user: UserItem) => {
    setEditingId(user.id);
    setEditRole(user.role);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: editRole })
      });
      if (res.ok) {
        const data = await res.json();
        
        // Update local state
        setUsers(prev => prev.map(u => {
          if (u.id === id) {
             const style = getAvatarStyle(data.user.role);
             return { ...u, role: data.user.role, avatarBg: style.bg, avatarColor: style.color };
          }
          return u;
        }));
        setEditingId(null);
      } else {
        alert("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Server error. Could not update role.");
    }
  };

  const handleExportData = () => {
    if (users.length === 0) return;
    
    // Create CSV content
    const headers = ["ID", "Name", "Email", "Role", "Joined Date"];
    const csvRows = [headers.join(",")];
    
    users.forEach(u => {
      const values = [u.id, `"${u.fullName}"`, `"${u.email}"`, u.role, `"${u.joinedDate}"`];
      csvRows.push(values.join(","));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tourney_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout breadcrumb="Users" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>User Management</h1>
          <p>View and manage all registered users in the system.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary" onClick={handleExportData}>
            <Download className="admin-btn-ic" size={16} /> Export Data
          </button>
          <button className="admin-btn admin-btn--primary">
            <Plus className="admin-btn-ic" size={16} /> Add User
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
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">Loading users...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No users found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-activity-cell">
                          <div 
                            className="admin-avatar" 
                            style={{ background: u.avatarBg, color: u.avatarColor, width: 36, height: 36, fontSize: 14 }}
                          >
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="admin-activity-title">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="admin-td-muted">{u.email}</td>
                      <td>
                        {editingId === u.id ? (
                           <select 
                             className="admin-search-input" 
                             style={{ width: '120px', padding: '4px 8px' }}
                             value={editRole}
                             onChange={(e) => setEditRole(e.target.value as UserRole)}
                           >
                             <option value="player">Player</option>
                             <option value="organizer">Organizer</option>
                             <option value="admin">Admin</option>
                           </select>
                        ) : (
                          <span className={`admin-badge ${getRoleBadgeClass(u.role)}`}>
                            {formatRoleText(u.role)}
                          </span>
                        )}
                      </td>
                      <td className="admin-td-muted">{u.joinedDate}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                          {editingId === u.id ? (
                            <>
                              <button className="admin-icon-btn admin-icon-btn--ok" title="Save Role" onClick={() => handleSaveEdit(u.id)}>
                                <Check size={14} />
                              </button>
                              <button className="admin-icon-btn admin-icon-btn--no" title="Cancel Edit" onClick={() => setEditingId(null)}>
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="admin-icon-btn admin-icon-btn--outline" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} title="Edit User Role" onClick={() => handleStartEdit(u)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="admin-icon-btn admin-icon-btn--no" title="Delete User" onClick={() => handleDelete(u.id, u.fullName)}>
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

export default AdminUsers;
