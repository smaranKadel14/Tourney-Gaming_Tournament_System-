import { useState, useEffect, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { Mail, Check, Trash2, Clock, User, MessageSquare, Loader2 } from "lucide-react";
import { getToken } from "../../../utils/auth";
import { api } from "../../../lib/api";
import "./AdminDashboard.css";

type MessageItem = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: string;
};

const AdminMessages = () => {
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);

  const fetchMessages = async () => {
    try {
      const token = getToken();
      const res = await api.get("/contact", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = getToken();
      await api.patch(`/contact/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: "read" } : m));
      if (selectedMessage?._id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: "read" } : null);
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <AdminLayout breadcrumb="Messages" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Inquiry Management</h1>
          <p>Read and respond to messages from your players and visitors.</p>
        </div>
      </header>

      <section className="admin-content-grid" style={{ gridTemplateColumns: selectedMessage ? '1.2fr 1fr' : '1fr' }}>
        {/* Messages List */}
        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <h2>Recent Messages</h2>
            <span className="admin-td-muted">{messages.filter(m => m.status === 'pending').length} Unread</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SENDER</th>
                  <th>MESSAGE PREVIEW</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <Loader2 className="spinning-loader" size={24} />
                      <p className="admin-td-muted" style={{ marginTop: '8px' }}>Loading messages...</p>
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No messages found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((m) => (
                    <tr 
                      key={m._id} 
                      className={`admin-row-clickable ${selectedMessage?._id === m._id ? 'admin-row-selected' : ''} ${m.status === 'pending' ? 'admin-row-unread' : ''}`}
                      onClick={() => {
                        setSelectedMessage(m);
                        if (m.status === 'pending') handleMarkAsRead(m._id);
                      }}
                    >
                      <td>
                        <div className="admin-activity-cell">
                          <div 
                            className="admin-avatar" 
                            style={{ 
                              background: m.status === 'pending' ? 'rgba(162, 0, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                              color: m.status === 'pending' ? '#a200ff' : '#94a3b8',
                              width: 36, height: 36, fontSize: 14 
                            }}
                          >
                            {m.firstName.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="admin-activity-title">{m.firstName} {m.lastName}</span>
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="admin-td-muted">
                        <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.message}
                        </div>
                      </td>
                      <td className="admin-td-muted" style={{ fontSize: '12px' }}>{formatDate(m.createdAt)}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${m.status === 'read' ? 'completed' : m.status === 'replied' ? 'processing' : 'pending-review'}`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                           <button 
                             className="admin-icon-btn admin-icon-btn--outline" 
                             style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedMessage(m);
                             }}
                           >
                             <MessageSquare size={14} />
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

        {/* Message Viewer Pane */}
        {selectedMessage && (
          <div className="admin-panel admin-viewer-panel" style={{ animation: 'slideLeft 0.3s ease-out' }}>
            <div className="admin-panel-head">
              <h2>Message Details</h2>
              <button 
                className="admin-icon-btn admin-icon-btn--no" 
                onClick={() => setSelectedMessage(null)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="admin-viewer-content">
              <div className="admin-viewer-header">
                <div className="admin-avatar" style={{ width: 60, height: 60, fontSize: 24 }}>
                  {selectedMessage.firstName.charAt(0)}
                </div>
                <div className="admin-viewer-meta">
                  <h3>{selectedMessage.firstName} {selectedMessage.lastName}</h3>
                  <p className="admin-td-muted">{selectedMessage.email}</p>
                  <div className="admin-tag-row">
                    <span className="admin-tag"><Clock size={12} /> {formatDate(selectedMessage.createdAt)}</span>
                    <span className={`admin-badge admin-badge--${selectedMessage.status === 'read' ? 'completed' : 'pending-review'}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-viewer-body">
                <div className="admin-message-bubble">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="admin-viewer-footer">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Tournament Support Response`} 
                  className="admin-btn admin-btn--primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Mail size={16} /> Reply via Email
                </a>
                <button 
                  className="admin-btn admin-btn--outline"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .admin-row-clickable { cursor: pointer; transition: background 0.2s; }
        .admin-row-clickable:hover { background: rgba(255,255,255,0.03); }
        .admin-row-selected { background: rgba(162, 0, 255, 0.05); }
        .admin-row-unread { font-weight: 600; }
        .admin-row-unread .admin-activity-title { color: #fff; }
        
        .admin-viewer-panel { border-left: 2px solid var(--accent-primary); }
        .admin-viewer-content { padding: 20px 0; }
        .admin-viewer-header { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; }
        .admin-viewer-meta h3 { margin: 0; font-size: 20px; color: #fff; }
        .admin-tag-row { display: flex; gap: 10px; margin-top: 8px; align-items: center; }
        .admin-tag { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        
        .admin-viewer-body { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px; line-height: 1.6; color: #e2e8f0; min-height: 150px; }
        .admin-viewer-footer { display: flex; gap: 12px; }
        
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .spinning-loader { animation: spin 1s linear infinite; color: var(--accent-primary); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminMessages;
