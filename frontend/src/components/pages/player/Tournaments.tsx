import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import { getToken } from "../../../utils/auth";
import PlayerNavbar from "./PlayerNavbar";
import PlayerFooter from "./PlayerFooter";
import "./Tournaments.css";

// Assets
import bg from "../../../assets/home/background.png";
import valImg from "../../../assets/Tournaments/VAL.png";
import codImg from "../../../assets/Tournaments/COD.png";
import csImg from "../../../assets/Tournaments/CS.png";
import lolImg from "../../../assets/Tournaments/LOL.png";

const getGameImage = (gameTitle?: string) => {
  if (!gameTitle) return valImg;
  const title = gameTitle.toLowerCase();
  if (title.includes("call of duty") || title.includes("cod") || title.includes("warzone")) return codImg;
  if (title.includes("counter-strike") || title.includes("cs")) return csImg;
  if (title.includes("league of legends") || title.includes("lol")) return lolImg;
  if (title.includes("pubg") || title.includes("battlegrounds")) return codImg; // Use COD as a temporary similar style
  return valImg;
};

type GameInfo = {
  _id: string;
  title: string;
  imageUrl: string;
  genre: string[];
};

type Tournament = {
  _id: string;
  title: string;
  game: GameInfo;
  description: string;
  startDate: string;
  prizePool: string;
  registrationFee: number;
  status: "upcoming" | "ongoing" | "completed";
  teamSize: number;
  imageUrl?: string;
  participantsCount?: number;
  maxParticipants?: number;
};

const TournamentSkeleton = () => {
  return (
    <div className="pt-feed-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="pt-card-skeleton">
          <div className="skeleton-hero skeleton-shimmer"></div>
          <div className="skeleton-content">
            <div className="skeleton-meta skeleton-shimmer"></div>
            <div className="skeleton-title skeleton-shimmer"></div>
            <div className="skeleton-box-row">
              <div className="skeleton-box skeleton-shimmer"></div>
              <div className="skeleton-box skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myHistoryIds, setMyHistoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filtering and search
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('All Status');
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const resetFilters = () => {
    setSelectedGames([]);
    setSelectedGenre('');
    setShowFreeOnly(false);
    setStatus('All Status');
    setSearchQuery("");
  };



  // Computes the list of tournaments based on active filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (selectedGames.length > 0) {
        const matchesGame = selectedGames.some(game => {
          const dbTitle = t.game?.title?.toLowerCase() || "";
          const filterTitle = game.toLowerCase();
          if (filterTitle === "counter-strike 2" && (dbTitle.includes("counter") || dbTitle.includes("cs"))) return true;
          return dbTitle.includes(filterTitle);
        });
        if (!matchesGame) return false;
      }
      
      if (selectedGenre) {
        const gameGenres = t.game?.genre || [];
        const matchesGenre = gameGenres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
        if (!matchesGenre) return false;
      }

      if (showFreeOnly && t.registrationFee > 0) {
        return false;
      }

      let targetDbStatus = "";
      if (status === "Open Registration") targetDbStatus = "upcoming";
      else if (status === "Ongoing") targetDbStatus = "ongoing";
      
      if (targetDbStatus && t.status !== (targetDbStatus as any)) {
          return false;
      }

      if (status === "Open Registration" && myHistoryIds.includes(t._id)) {
          return false;
      }

      return true;
    });
  }, [tournaments, selectedGames, selectedGenre, showFreeOnly, status, searchQuery]);

  // Fetches tournaments and user history to highlight joined ones
  useEffect(() => {
    const fetchTournamentsAndHistory = async () => {
      try {
        const response = await api.get('/tournaments');
        const tournamentData = Array.isArray(response.data) ? response.data : response.data.tournaments;
        setTournaments(tournamentData || []);

        const token = getToken();
        if (token) {
           const profileRes = await api.get('/users/profile', {
             headers: { Authorization: `Bearer ${token}` }
           });
           if (profileRes.data && profileRes.data.history) {
               const ids = profileRes.data.history.map((t: any) => typeof t === 'string' ? t : t._id);
               setMyHistoryIds(ids);
           }
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentsAndHistory();
  }, []);

  const toggleGame = (game: string) => {
    setSelectedGames(prev => prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]);
  };

  return (
    <div className="pt-page">
      <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pt-overlay" />

      <div className="pt-wrap">
        <PlayerNavbar />

        <div className="pt-mobile-filter-toggle">
          <button onClick={() => setShowFilters(!showFilters)}>
            <i className="fas fa-filter"></i> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="pt-layout">
          {/* LEFT SIDEBAR */}
          <aside className={`pt-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="pt-filters">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="pt-filter-heading">FILTERS</h3>
                {(selectedGames.length > 0 || selectedGenre || showFreeOnly || status !== 'All Status' || searchQuery) && (
                  <button className="pt-reset-btn" onClick={resetFilters}>Reset All</button>
                )}
              </div>

              {/* Search Box */}
              <div className="pt-filter-group">
                <div className="pt-search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search tournaments..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="pt-search-clear" onClick={() => setSearchQuery("")}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Popular Games */}
              <div className="pt-filter-group">
                <h4 className="pt-filter-title">Popular Games</h4>
                <div className="pt-checkbox-list">
                  {['Valorant', 'Counter-Strike 2', 'League of Legends', 'Call of Duty Warzone', 'PUBG'].map(game => (
                    <label key={game} className="pt-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={selectedGames.includes(game)}
                        onChange={() => toggleGame(game)}
                      />
                      <span className="pt-checkbox-custom"></span>
                      {game}
                    </label>
                  ))}
                </div>
              </div>

              {/* Genre Dropdown */}
              <div className="pt-filter-group">
                <h4 className="pt-filter-title">Genre</h4>
                <div className="pt-custom-dropdown">
                  <button 
                    className={`pt-dropdown-trigger ${isGenreOpen ? 'active' : ''}`}
                    onClick={() => setIsGenreOpen(!isGenreOpen)}
                  >
                    <span>{selectedGenre || 'All Genres'}</span>
                    <i className={`fas fa-chevron-${isGenreOpen ? 'up' : 'down'}`}></i>
                  </button>
                  
                  {isGenreOpen && (
                    <div className="pt-dropdown-menu">
                      <div 
                        className={`pt-dropdown-item ${selectedGenre === '' ? 'selected' : ''}`}
                        onClick={() => { setSelectedGenre(''); setIsGenreOpen(false); }}
                      >
                        All Genres
                      </div>
                      {['FPS', 'MOBA', 'Battle Royale', 'Fighter'].map(genre => (
                        <div 
                          key={genre}
                          className={`pt-dropdown-item ${selectedGenre === genre ? 'selected' : ''}`}
                          onClick={() => { setSelectedGenre(genre); setIsGenreOpen(false); }}
                        >
                          {genre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Fee Toggle */}
              <div className="pt-filter-group">
                <h4 className="pt-filter-title">Entry Fee</h4>
                <div className="pt-toggle-container">
                  <label className="pt-toggle-label">
                    <input 
                      type="checkbox" 
                      checked={showFreeOnly}
                      onChange={() => setShowFreeOnly(!showFreeOnly)}
                    />
                    <span className="pt-toggle-slider"></span>
                    Show Free Only
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="pt-filter-group">
                <h4 className="pt-filter-title">Status</h4>
                <div className="pt-radio-list">
                  {['All Status', 'Open Registration', 'Ongoing'].map(stat => (
                    <label key={stat} className="pt-radio-label">
                      <input 
                        type="radio" 
                        name="status"
                        checked={status === stat}
                        onChange={() => setStatus(stat)}
                      />
                      <span className="pt-radio-custom"></span>
                      {stat}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="pt-main">
            <header className="pt-feed-header">
              <div className="pt-feed-title-box">
                <span className="pt-feed-label">
                  <span className="live-dot"></span>
                  LIVE COMPETITION FEED
                </span>
                <h1 className="pt-feed-title">ACTIVE TOURNAMENTS</h1>
                <p className="pt-results-count">
                  Showing {filteredTournaments.length} {filteredTournaments.length === 1 ? 'tournament' : 'tournaments'}
                  {tournaments.length !== filteredTournaments.length && ` (filtered from ${tournaments.length})`}
                </p>
              </div>
            </header>

            {loading ? (
              <TournamentSkeleton />
            ) : filteredTournaments.length === 0 ? (
              <div className="pt-loading">No active tournaments available for these filters. Check back soon!</div>
            ) : (
              <div className="pt-feed-grid">
                {filteredTournaments.map((tourney) => (
                  <Link to={`/tournament/${tourney._id}`} key={tourney._id} className="pt-card-link">
                    <div className="pt-adv-card">
                      {/* Hero Image Block */}
                      <div className="pt-card-hero">
                        <img 
                          src={tourney.imageUrl ? (tourney.imageUrl.startsWith('http') ? tourney.imageUrl : `http://localhost:5000${tourney.imageUrl}`) : getGameImage(tourney.game?.title)} 
                          alt={tourney.title} 
                          className="pt-card-img" 
                        />
                        <div className="pt-card-hero-overlay"></div>
                        <div className="pt-badge-entry">
                           ENTRY: {tourney.registrationFee > 0 ? `Rs ${tourney.registrationFee}` : "FREE"}
                        </div>
                        <div className="pt-badge-type" style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: '#a200ff',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                        }}>
                           TEAM ({(tourney.teamSize && tourney.teamSize >= 2) ? tourney.teamSize : 5})
                        </div>
                      </div>

                      {/* Content Block */}
                      <div className="pt-card-content">
                        <div className="pt-card-meta">
                          <span className="pt-meta-game">{tourney.game?.title || "ESPORTS"}</span>
                          <span className="pt-meta-date">{new Date(tourney.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} • {new Date(tourney.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <h2 className="pt-card-title">{tourney.title}</h2>
                        
                        <div className="pt-stats-row">
                          <div className="pt-stat-box pt-stat-prize">
                            <span className="pt-stat-label">PRIZE POOL</span>
                            <span className="pt-stat-value">{tourney.prizePool || "$0.00"}</span>
                          </div>
                          <div className="pt-stat-box pt-stat-slots">
                            <span className="pt-stat-label">SLOTS</span>
                            <div className="pt-slot-value-wrap">
                              <span className="pt-stat-value-white">
                                {tourney.participantsCount || 0} / {tourney.maxParticipants === 0 ? "∞" : (tourney.maxParticipants || 64)}
                              </span>
                              <i className="fas fa-user-friends"></i>
                            </div>
                          </div>
                        </div>

                        <div className="pt-card-footer" style={{ justifyContent: 'flex-end' }}>
                          {myHistoryIds.includes(tourney._id) ? (
                              <button className="pt-card-action-btn pt-btn-outline" style={{background: '#22c55e', color: 'white', borderColor: '#22c55e'}} onClick={(e) => { e.preventDefault(); }}>JOINED</button>
                          ) : (
                              <button className="pt-card-action-btn pt-btn-outline">REGISTER NOW</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <PlayerFooter />
    </div>
  );
}
