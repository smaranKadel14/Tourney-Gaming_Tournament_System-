import { useState } from "react";
import "./OrganizerPlayers.css";

type PlayerStatus = "Active" | "Banned" | "Pending";

type PlayerRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  tournamentsPlayed: number;
  joinDate: string;
  status: PlayerStatus;
};

// Dummy Data
const DUMMY_PLAYERS: PlayerRow[] = [
  { id: "P1002", name: "Sarah Connor", username: "termSlayer", email: "sarah@resistance.net", tournamentsPlayed: 14, joinDate: "Oct 12, 2025", status: "Active" },
  { id: "P1005", name: "John Wick", username: "babaYaga", email: "john@continental.com", tournamentsPlayed: 42, joinDate: "Jan 15, 2026", status: "Active" },
  { id: "P2041", name: "Ellen Ripley", username: "nukeItFromOrbit", email: "ripley@weyland.co", tournamentsPlayed: 3, joinDate: "Feb 02, 2026", status: "Active" },
  { id: "P3099", name: "Arthur Morgan", username: "outlawStar", email: "arthur@vanderlinde.w", tournamentsPlayed: 8, joinDate: "Nov 30, 2025", status: "Pending" },
  { id: "P4012", name: "Micah Bell", username: "rat23", email: "micah@van.der", tournamentsPlayed: 2, joinDate: "Dec 01, 2025", status: "Banned" },
  { id: "P5501", name: "Lara Croft", username: "tombRaider", email: "lara@croft.org", tournamentsPlayed: 27, joinDate: "Sep 05, 2025", status: "Active" },
];

const OrganizerPlayers = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | PlayerStatus>("All");

  const filtered = DUMMY_PLAYERS.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    const matchTab = activeTab === "All" || p.status === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="op-container animate-fade-in">
      <div className="op-header">
        <div>
          <h2 className="op-title">Player Management</h2>
          <p className="op-subtitle">View and manage players registered across all your tournaments.</p>
        </div>
        <div className="op-actions">
           <div className="op-searchWrap">
             <span className="op-searchIcon">🔍</span>
             <input 
               className="op-search" 
               placeholder="Search players by name, username, or email..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
             />
           </div>
           <button className="op-export-btn">
             <span className="op-icon">📥</span> Export CSV
           </button>
        </div>
      </div>
      
      <div className="op-tabs">
        {["All", "Active", "Pending", "Banned"].map((tab) => (
          <button
            key={tab}
            className={`op-tab ${activeTab === tab ? "op-tab--active" : ""}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab} <span className="op-tab-count">
              {tab === "All" ? DUMMY_PLAYERS.length : DUMMY_PLAYERS.filter(p => p.status === tab).length}
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
                <th>CONTACT</th>
                <th>TOURNAMENTS</th>
                <th>JOIN DATE</th>
                <th>STATUS</th>
                <th className="op-thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="op-playerInfo">
                      <div className="op-avatar">{p.name.charAt(0)}</div>
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
                  <td className="op-actions-cell">
                    <button className="op-btn-sm op-btn-sm--outline">View</button>
                    <button className="op-dots" title="More Options">⋮</button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="op-empty">
                    <div className="op-empty-icon">👥</div>
                    <p>No players found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="op-tableFooter">
          <div className="op-mutedSmall">
            Showing {filtered.length} of {DUMMY_PLAYERS.length} players
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
