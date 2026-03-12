import { useState, useEffect, useCallback } from "react";
import "./OrganizerPlayers.css";
import { Search, Download, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getToken } from "../../../utils/auth";

const toUsername = (email: string) => email.split("@")[0];

type RegStatus = "pending" | "confirmed" | "cancelled" | "rejected";

type RegistrationRow = {
  registrationId: string;
  tournamentId: string;
  tournamentName: string;
  status: RegStatus;
  paymentStatus: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    memberSince?: string;
  };
  // optimistic UI state
  _updating?: boolean;
};

const statusLabel: Record<RegStatus, string> = {
  pending: "Pending",
  confirmed: "Active",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

// Map backend status to the CSS class suffix used in OrganizerPlayers.css
const badgeCss: Record<RegStatus, string> = {
  confirmed: "active",
  pending: "pending",
  rejected: "banned",
  cancelled: "banned",
};

const OrganizerPlayers = () => {
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | RegStatus>("All");

  const token = getToken();

  const fetchPlayers = useCallback(async () => {
    try {
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/tournaments/organizer/players", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRows(data);
      }
    } catch (err) {
      console.error("Failed to fetch players:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const handleStatusChange = async (row: RegistrationRow, newStatus: "confirmed" | "rejected") => {
    // Optimistic update
    setRows(prev => prev.map(r =>
      r.registrationId === row.registrationId ? { ...r, _updating: true } : r
    ));
    try {
      const res = await fetch(
        `http://localhost:5000/api/tournaments/${row.tournamentId}/registrations/${row.registrationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setRows(prev => prev.map(r =>
          r.registrationId === row.registrationId
            ? { ...r, status: newStatus, _updating: false }
            : r
        ));
      } else {
        // Revert on failure
        setRows(prev => prev.map(r =>
          r.registrationId === row.registrationId ? { ...r, _updating: false } : r
        ));
        const d = await res.json();
        alert(d.message || "Failed to update status.");
      }
    } catch (e) {
      console.error(e);
      setRows(prev => prev.map(r =>
        r.registrationId === row.registrationId ? { ...r, _updating: false } : r
      ));
      alert("Server error. Please try again.");
    }
  };

  const tabs: Array<"All" | RegStatus> = ["All", "pending", "confirmed", "rejected", "cancelled"];

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || (r.user?.fullName || "").toLowerCase().includes(q)
      || (r.user?.email || "").toLowerCase().includes(q)
      || (r.tournamentName || "").toLowerCase().includes(q);
    const matchTab = activeTab === "All" || r.status === activeTab;
    return matchSearch && matchTab;
  });

  const countByTab = (tab: "All" | RegStatus) =>
    tab === "All" ? rows.length : rows.filter(r => r.status === tab).length;

  const handleExportCSV = () => {
    const csvRows = [
      ["Player", "Email", "Tournament", "Registered", "Status", "Payment"],
      ...rows.map(r => [
        r.user?.fullName || "Unknown",
        r.user?.email || "",
        r.tournamentName || "Unknown",
        new Date(r.createdAt).toLocaleDateString(),
        r.status,
        r.paymentStatus,
      ]),
    ];
    const csv = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="op-container animate-fade-in">
      <div className="op-header">
        <div>
          <h2 className="op-title">Player Management</h2>
          <p className="op-subtitle">View and manage all registrations across your tournaments.</p>
        </div>
        <div className="op-actions">
          <div className="op-searchWrap">
            <Search className="op-searchIcon" size={18} />
            <input
              className="op-search"
              placeholder="Search by player, email or tournament..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="op-export-btn" onClick={handleExportCSV}>
            <Download className="op-icon" size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="op-tabs">
        {tabs.map((tab) => {
          const label = tab === "All" ? "All" : statusLabel[tab];
          return (
            <button
              key={tab}
              className={`op-tab ${activeTab === tab ? "op-tab--active" : ""} ${tab === "pending" ? "op-tab--pending" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {label} <span className="op-tab-count">{countByTab(tab)}</span>
            </button>
          );
        })}
      </div>

      <div className="op-panel">
        <div className="op-tableWrap">
          <table className="op-table">
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>TOURNAMENT</th>
                <th>EMAIL</th>
                <th>REGISTERED</th>
                <th>STATUS</th>
                <th className="op-thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="op-empty">
                    <div className="op-loader" />
                    <p>Loading registrations...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="op-empty">
                    <Users className="op-empty-icon" size={48} />
                    <p>{search || activeTab !== "All" ? "No registrations matching your criteria." : "No registrations yet."}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.registrationId}>
                    <td>
                      <div className="op-playerInfo">
                        <div className="op-avatar">
                          {r.user?.avatarUrl
                            ? <img src={`http://localhost:5000${r.user.avatarUrl}`} alt={r.user?.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                            : (r.user?.fullName || "U").charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div className="op-pName">{r.user?.fullName || "Unknown Player"}</div>
                          <div className="op-pUsername">@{toUsername(r.user?.email || "unknown@user")}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="op-tournament-badge">{r.tournamentName}</span>
                    </td>
                    <td className="op-muted">{r.user?.email || "No email"}</td>
                    <td className="op-muted">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                    </td>
                    <td>
                      <span className={`op__badge op__badge--${badgeCss[r.status]}`}>
                        <span className={`op-status-dot op-status-dot--${badgeCss[r.status]}`}></span>
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className="op-actions-cell">
                      {r.status === "pending" && (
                        r._updating ? (
                          <Loader2 size={16} className="op-spin" />
                        ) : (
                          <>
                            <button
                              className="op-action-btn op-action-btn--accept"
                              title="Accept"
                              onClick={() => handleStatusChange(r, "confirmed")}
                            >
                              <CheckCircle size={15} /> Accept
                            </button>
                            <button
                              className="op-action-btn op-action-btn--reject"
                              title="Reject"
                              onClick={() => handleStatusChange(r, "rejected")}
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </>
                        )
                      )}
                      {r.status === "confirmed" && (
                        <span className="op-muted" style={{ fontSize: "12px" }}>Enrolled ✓</span>
                      )}
                      {(r.status === "rejected" || r.status === "cancelled") && (
                        <span className="op-muted" style={{ fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="op-tableFooter">
          <div className="op-mutedSmall">
            Showing {filtered.length} of {rows.length} registrations
          </div>
          <div className="op-pager">
            <button className="op-pagerBtn" disabled>Prev</button>
            <button className="op-pagerBtn" disabled={filtered.length < 10}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPlayers;
