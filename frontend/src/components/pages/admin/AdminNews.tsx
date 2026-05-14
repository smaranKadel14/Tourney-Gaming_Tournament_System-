import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Plus, Edit2, Trash2, X, FileText } from "lucide-react";
import { getToken } from "../../../utils/auth";
import { api } from "../../../lib/api";
import "./AdminNews.css";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  publishedAt: string;
};

const AdminNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/news");
      setNews(res.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      content: ""
    });
    setIsEditing(false);
    setCurrentNewsId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      content: item.content
    });
    setIsEditing(true);
    setCurrentNewsId(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const token = getToken();
      await api.delete(`/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNews(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Failed to delete news article.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (isEditing && currentNewsId) {
        const res = await api.put(`/news/${currentNewsId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNews(prev => prev.map(item => item._id === currentNewsId ? res.data : item));
      } else {
        const res = await api.post("/news", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNews(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving news:", error);
      alert("Failed to save news article.");
    }
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout breadcrumb="News" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>News Management</h1>
          <p>Create and manage platform news, patch notes, and announcements.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
            <Plus className="admin-btn-ic" size={16} /> Create News
          </button>
        </div>
      </header>

      <section className="admin-content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>All Articles</h2>
            <span className="admin-td-muted">{filteredNews.length} articles</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ARTICLE</th>
                  <th>PUBLISHED DATE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">Loading news...</span>
                    </td>
                  </tr>
                ) : filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No news articles found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="admin-activity-cell">
                          <div className="admin-mini-ic admin-mini-ic--tournament">
                             <FileText size={16} />
                          </div>
                          <div className="admin-news-info">
                            <span className="admin-activity-title">{item.title}</span>
                            <span className="admin-td-muted admin-news-excerpt">{item.content.substring(0, 70) + "..."}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-td-muted">
                          {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-approval-actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="admin-icon-btn admin-icon-btn--outline" 
                            style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="admin-icon-btn admin-icon-btn--no"
                            onClick={() => handleDelete(item._id, item.title)}
                          >
                            <Trash2 size={14} />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h2>{isEditing ? "Edit News Article" : "Create New Article"}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label>Article Title</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter article title"
                />
              </div>
              <div className="admin-form-group">
                <label>Content</label>
                <textarea 
                  required 
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your news article here..."
                ></textarea>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {isEditing ? "Update Article" : "Publish News"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNews;
