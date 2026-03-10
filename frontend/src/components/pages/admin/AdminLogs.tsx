import { useState, useMemo } from "react";
import AdminLayout from "./AdminLayout";
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

const categoryIcon: Record<LogItem["category"], string> = {
  AUTH: "🔐",
  SYSTEM: "⚙️",
  USER: "👤",
  TOURNAMENT: "🏆",
};

const categoryColor: Record<LogItem["category"], string> = {
  AUTH: "#ef4444",
  SYSTEM: "#60a5fa",
  USER: "#c084fc",
  TOURNAMENT: "#fbbf24",
};

const LOGS: LogItem[] = [
  { id: "l1", timestamp: "2024-03-10 17:30:02", event: "Failed Login Attempt", category: "AUTH", actor: "unknown@email.com", severity: "error", details: "3 consecutive failed logins from IP 192.168.1.45" },
  { id: "l2", timestamp: "2024-03-10 17:15:44", event: "Admin User Created", category: "USER", actor: "admin@tourney.com", severity: "success", details: "New admin account system@tourney.com created via script" },
  { id: "l3", timestamp: "2024-03-10 16:50:10", event: "Tournament Approved", category: "TOURNAMENT", actor: "admin@tourney.com", severity: "success", details: "Approved 'Summer Championship 2024' by Organizer EpicEvents LLC" },
  { id: "l4", timestamp: "2024-03-10 15:30:55", event: "High Memory Usage", category: "SYSTEM", actor: "system", severity: "warning", details: "Server memory usage exceeded 80% threshold" },
  { id: "l5", timestamp: "2024-03-10 14:00:00", event: "Database Backup", category: "SYSTEM", actor: "system", severity: "info", details: "Scheduled daily database backup completed successfully" },
  { id: "l6", timestamp: "2024-03-10 13:45:12", event: "User Role Changed", category: "USER", actor: "admin@tourney.com", severity: "info", details: "User 'Player_99' role changed from player to organizer" },
  { id: "l7", timestamp: "2024-03-10 12:10:33", event: "Suspicious Login Detected", category: "AUTH", actor: "player99@email.com", severity: "warning", details: "Login from new geographical location: Singapore" },
  { id: "l8", timestamp: "2024-03-10 10:05:00", event: "API Rate Limit Hit", category: "SYSTEM", actor: "IP 203.0.113.52", severity: "warning", details: "Rate limit exceeded on /api/tournaments endpoint" },
];

const AdminLogs = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | "all">("all");

  const filteredLogs = useMemo(() => {
    let list = LOGS;
    if (severityFilter !== "all") {
      list = list.filter((l) => l.severity === severityFilter);
    }
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
  }, [search, severityFilter]);

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

  return (
    <AdminLayout breadcrumb="System Logs" search={search} onSearch={setSearch}>
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>System Logs</h1>
          <p>Real‑time audit trail of system events, security actions, and user activity.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn--secondary">
            <span className="admin-btn-ic">⭳</span> Export Logs
          </button>
          <button className="admin-btn admin-btn--primary">
            <span className="admin-btn-ic">↻</span> Refresh
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
                {filteredLogs.map((log) => (
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
                            background: `color-mix(in srgb, ${categoryColor[log.category]} 15%, transparent)`,
                            color: categoryColor[log.category],
                            width: 32, height: 32, fontSize: 14, borderRadius: 6
                          }}
                        >
                          {categoryIcon[log.category]}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminLogs;
