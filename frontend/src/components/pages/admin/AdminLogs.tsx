import { useState, useMemo, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Download, RefreshCw, Lock, Settings, User, Trophy } from "lucide-react";
import { getToken } from "../../../utils/auth";
import "./AdminDashboard.css";

type LogSeverity = "info" | "success" | "warning" | "error";

type LogItem = {
  id: string;
  timestamp: string;
  event: string;
  category: "AUTH" | "SYSTEM" | "USER" | "TOURNAMENT";
  actor: string;
  severity: LogSeverity;
  details: string;
};

const categoryIcon: Record<LogItem["category"], React.ReactNode> = {
  AUTH: <Lock size={16} />,
  SYSTEM: <Settings size={16} />,
  USER: <User size={16} />,
  TOURNAMENT: <Trophy size={16} />,
};

const categoryColor: Record<LogItem["category"], string> = {
  AUTH: "#ef4444",
  SYSTEM: "#60a5fa",
  USER: "#c084fc",
  TOURNAMENT: "#fbbf24",
};

const AdminLogs = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "all">("all");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = "http://localhost:5000/api/admin/logs";
      if (severityFilter !== "all") {
        url += `?severity=${severityFilter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((l: any) => ({
          id: l._id,
          timestamp: new Date(l.createdAt).toLocaleString("en-US", { hour12: false }),
          event: l.event,
          category: l.category,
          actor: l.actor,
          severity: l.severity,
          details: l.details
        }));
        setLogs(formatted);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [severityFilter]);

  const filteredLogs = useMemo(() => {
    let list = logs;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.event.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, search]);

  const getSeverityBadge = (severity: LogSeverity) => {
    const map: Record<LogSeverity, string> = {
      info: "admin-badge--processing",
      success: "admin-badge--completed",
      warning: "admin-badge--pending-review",
      error: "admin-badge--error",
    };
    return map[severity];
  };

  const severityFilters: Array<{ label: string; value: LogSeverity | "all" }> = [
    { label: "All", value: "all" },
    { label: "Info", value: "info" },
    { label: "Success", value: "success" },
    { label: "Warning", value: "warning" },
    { label: "Error", value: "error" },
  ];

  const handleExportLogs = () => {
    if (filteredLogs.length === 0) return;
    
    // Create CSV content
    const headers = ["ID", "Timestamp", "Event", "Category", "Actor", "Severity", "Details"];
    const csvRows = [headers.join(",")];
    
    filteredLogs.forEach(l => {
      const values = [
        l.id, 
        `"${l.timestamp}"`, 
        `"${l.event}"`, 
        l.category,
        `"${l.actor}"`, 
        l.severity,
        `"${l.details.replace(/"/g, '""')}"`
      ];
      csvRows.push(values.join(","));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_logs_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout breadcrumb="System Logs" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>System Logs</h1>
          <p>Real‑time audit trail of system events, security actions, and user activity.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary" onClick={handleExportLogs}>
            <Download className="admin-btn-ic" size={16} /> Export Logs
          </button>
          <button className="admin-btn admin-btn--primary" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`admin-btn-ic ${loading ? 'spinning' : ''}`} size={16} /> Refresh
          </button>
        </div>
      </header>

      {/* Summary chips */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap', padding: '0 32px' }}>
        {severityFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setSeverityFilter(f.value)}
            className={`admin-btn ${severityFilter === f.value ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
            style={{ padding: '6px 14px', fontSize: 13, width: 'max-content', flex: '0 0 auto', borderRadius: '20px' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="admin-content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="admin-panel admin-activity-panel">
          <div className="admin-panel-head">
            <h2>Audit Trail</h2>
            <span className="admin-td-muted">{filteredLogs.length} events</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>EVENT</th>
                  <th>ACTOR / IP</th>
                  <th>SEVERITY</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">Loading logs...</span>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      <span className="admin-td-muted">No logs found matching filter.</span>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="admin-td-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {log.timestamp}
                        </span>
                      </td>
                      <td>
                        <div className="admin-activity-cell">
                          <div
                            className="admin-avatar"
                            style={{
                              background: `color-mix(in srgb, ${categoryColor[log.category] || categoryColor["SYSTEM"]} 15%, transparent)`,
                              color: categoryColor[log.category] || categoryColor["SYSTEM"],
                              width: 32, height: 32, fontSize: 14, borderRadius: 6
                            }}
                          >
                            {categoryIcon[log.category] || <Settings size={16} />}
                          </div>
                          <div>
                            <div className="admin-activity-title" style={{ fontWeight: 500 }}>{log.event}</div>
                            <div className="admin-td-muted" style={{ fontSize: 11 }}>[{log.category}]</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-td-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {log.actor}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${getSeverityBadge(log.severity)}`} style={{ textTransform: 'capitalize' }}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="admin-td-muted" style={{ maxWidth: 260, whiteSpace: 'normal', fontSize: 12 }}>
                        {log.details}
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

export default AdminLogs;
