import { useState, useEffect } from "react";
import "./OrganizerPlayers.css";
import { Search, Download, Users } from "lucide-react";
import { getToken } from "../../../utils/auth";

// Since the User model has no username field, we derive it from the email prefix
const toUsername = (email: string) => email.split("@")[0];

type PlayerStatus = "Active" | "Pending";

type PlayerRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  tournamentsPlayed: number;
  joinDate: string;
  status: PlayerStatus;
};

const OrganizerPlayers = () => {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | PlayerStatus>("All");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/tournaments/organizer/players", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const formatted: PlayerRow[] = data.map((p: any) => ({
            id: p._id,
            name: p.fullName,
            username: toUsername(p.email),
            email: p.email,
            avatarUrl: p.avatarUrl,
            tournamentsPlayed: p.tournamentsPlayed,
            joinDate: p.createdAt
              ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "—",
            // "confirmed" = Active, everything else = Pending
            status: p.latestStatus === "confirmed" ? "Active" : "Pending",
          }));
          setPlayers(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch players:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filtered = players.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    const matchTab = activeTab === "All" || p.status === activeTab;
    return matchSearch && matchTab;
  });

  const handleExportCSV = () => {
    const rows = [
      ["Name", "Email", "Username", "Tournaments Played", "Join Date", "Status"],
      ...players.map(p => [p.name, p.email, p.username, p.tournamentsPlayed, p.joinDate, p.status]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "players.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="op-container animate-fade-in">
      <div className="op-header">
        <div>
          <h2 className="op-title">Player Management</h2>
          <p className="op-subtitle">View and manage players registered across all your tournaments.</p>
        </div>
        <div className="op-actions">
           <div className="op-searchWrap">
             <Search className="op-searchIcon" size={18} />
             <input
               className="op-search"
               placeholder="Search players by name, username, or email..."
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
        {(["All", "Active", "Pending"] as const).map((tab) => (
          <button
            key={tab}
            className={`op-tab ${activeTab === tab ? "op-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="op-tab-count">
              {tab === "All" ? players.length : players.filter(p => p.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="op-panel">
        <div className="op-tableWrap">
          <table className="op-table">
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>EMAIL</th>
                <th>TOURNAMENTS</th>
                <th>JOIN DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="op-empty">
                    <div className="op-loader" />
                    <p>Loading players...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="op-empty">
                    <Users className="op-empty-icon" size={48} />
                    <p>{search || activeTab !== "All" ? "No players found matching your criteria." : "No players have registered for your tournaments yet."}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="op-playerInfo">
                        <div className="op-avatar">
                          {p.avatarUrl
                            ? <img src={`http://localhost:5000${p.avatarUrl}`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "999px" }} />
                            : p.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <div className="op-pName">{p.name}</div>
                          <div className="op-pUsername">@{p.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="op-muted">{p.email}</td>
                    <td className="op-muted">
                      <span className="op-statBadge">{p.tournamentsPlayed} Events</span>
                    </td>
                    <td className="op-muted">{p.joinDate}</td>
                    <td>
                      <span className={`op__badge op__badge--${p.status.toLowerCase()}`}>
                        <span className={`op-status-dot op-status-dot--${p.status.toLowerCase()}`}></span>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="op-tableFooter">
          <div className="op-mutedSmall">
            Showing {filtered.length} of {players.length} players
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
