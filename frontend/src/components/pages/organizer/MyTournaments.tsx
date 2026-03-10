import "./MyTournaments.css";
import { useState } from "react";

type TournamentStatus = "Live" | "Registrations Open" | "Completed" | "Draft";

type TournamentRow = {
  id: string;
  name: string;
  game: string;
  date: string;
  status: TournamentStatus;
  participants: string;
};

interface MyTournamentsProps {
  tournaments: TournamentRow[];
  loading: boolean;
  onCreateNew?: () => void;
}

const MyTournaments = ({ tournaments, loading, onCreateNew }: MyTournamentsProps) => {
  const [activeTab, setActiveTab] = useState<"All" | TournamentStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = tournaments.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchTab = activeTab === "All" || t.status === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="mt-container animate-fade-in">
      <div className="mt-header">
        <div>
          <h2 className="mt-title">My Tournaments</h2>
          <p className="mt-subtitle">Manage, edit, and track your created events.</p>
        </div>
        <div className="mt-actions">
           <div className="mt-searchWrap">
             <span className="mt-searchIcon">🔍</span>
             <input 
               className="mt-search" 
               placeholder="Search..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
             />
           </div>
           <button className="mt-filter-btn">
             <span>⏳</span> Filter
           </button>
        </div>
      </div>
      
      <div className="mt-tabs">
        {["All", "Live", "Registrations Open", "Completed", "Draft"].map((tab) => (
          <button
            key={tab}
            className={`mt-tab ${activeTab === tab ? "mt-tab--active" : ""}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab} <span className="mt-tab-count">
              {tab === "All" ? tournaments.length : tournaments.filter(t => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-grid">
        {loading ? (
          <div className="mt-empty">
            <div className="mt-loader"></div>
            <p>Loading tournaments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-empty">
            <div className="mt-empty-icon">📂</div>
            <h3>No Tournaments Found</h3>
            <p>Try adjusting your search or filters.</p>
            {(activeTab === "All" && !search) && (
              <button className="mt-btn mt-btn--primary mt-4" onClick={onCreateNew}>
                Create Your First Tournament
              </button>
            )}
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="mt-card">
              <div className="mt-card-top">
                <span className={`od__badge od__badge--${badgeClass(t.status)}`}>
                  <span className={`mt-status-dot mt-status-dot--${badgeClass(t.status)}`}></span>
                  {t.status}
                </span>
                <button className="od__dots" title="Options">⋮</button>
              </div>
              <div className="mt-card-body">
                <h3 className="mt-card-title" title={t.name}>{t.name}</h3>
                <p className="mt-card-game">{t.game}</p>
                
                <div className="mt-divider"></div>

                <div className="mt-card-meta">
                  <div className="mt-meta-item">
                    <span className="mt-icon">📅</span> {t.date}
                  </div>
                  <div className="mt-meta-item">
                    <span className="mt-icon">👥</span> {t.participants} Players
                  </div>
                </div>
              </div>
              <div className="mt-card-footer">
                <button className="mt-btn mt-btn--secondary">View</button>
                <div className="mt-footer-right">
                  <button className="mt-btn mt-btn--primary">Manage</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function badgeClass(status: string) {
  switch (status) {
    case "Live":
      return "live";
    case "Registrations Open":
      return "open";
    case "Completed":
      return "done";
    case "Draft":
      return "draft";
    default:
      return "draft";
  }
}

export default MyTournaments;
