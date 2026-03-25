import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";

import PlayerNavbar from "./PlayerNavbar";
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
};

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States - Default to empty to show all
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('All Status');
  const [isGenreOpen, setIsGenreOpen] = useState(false);



  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Game Filter
      if (selectedGames.length > 0) {
        const matchesGame = selectedGames.some(game => {
          const dbTitle = t.game?.title?.toLowerCase() || "";
          const filterTitle = game.toLowerCase();
          if (filterTitle === "counter-strike 2" && (dbTitle.includes("counter") || dbTitle.includes("cs"))) return true;
          return dbTitle.includes(filterTitle);
        });
        if (!matchesGame) return false;
      }
      
      // 2. Genre Filter
      if (selectedGenre) {
        const gameGenres = t.game?.genre || [];
        const matchesGenre = gameGenres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
        if (!matchesGenre) return false;
      }

      // 3. Free Only Filter
      if (showFreeOnly && t.registrationFee > 0) {
        return false;
      }

      // 4. Status Filter
      // Map sidebar status to DB status
      let targetDbStatus = "";
      if (status === "Open Registration") targetDbStatus = "upcoming";
      else if (status === "Ongoing") targetDbStatus = "ongoing";
      
      if (targetDbStatus && t.status !== (targetDbStatus as any)) {
          // If we are looking for 'upcoming' (Open Reg), show upcoming
          if (targetDbStatus === "upcoming" && t.status === "upcoming") return true;
          // If we are looking for 'ongoing', show ongoing
          if (targetDbStatus === "ongoing" && t.status === "ongoing") return true;
          
          return false;
      }

      return true;
    });
  }, [tournaments, selectedGames, selectedGenre, showFreeOnly, status]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get('/tournaments');
        setTournaments(response.data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
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

        <div className="pt-layout">
          {/* LEFT SIDEBAR */}
          <aside className="pt-sidebar">
            <div className="pt-filters">
              <h3 className="pt-filter-heading">FILTERS</h3>

              {/* Popular Games */}
              <div className="pt-filter-group">
                <h4 className="pt-filter-title">Popular Games</h4>
                <div className="pt-checkbox-list">
                  {['Valorant', 'Counter-Strike 2', 'League of Legends', 'Dota 2'].map(game => (
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
                <span className="pt-feed-label">LIVE COMPETITION FEED</span>
                <h1 className="pt-feed-title">ACTIVE TOURNAMENTS</h1>
              </div>
              <div className="pt-feed-controls">
                <button className="pt-sort-btn">
                  <i className="fas fa-sort-amount-down"></i> Latest
                </button>
                <button className="pt-view-btn">
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
            </header>

            {loading ? (
              <div className="pt-loading">Loading tournaments data...</div>
            ) : filteredTournaments.length === 0 ? (
              <div className="pt-loading">No active tournaments available for these filters. Check back soon!</div>
            ) : (
              <div className="pt-feed-grid">
                {filteredTournaments.map((tourney) => (
                  <Link to={`/tournament/${tourney._id}`} key={tourney._id} className="pt-card-link">
                    <div className="pt-adv-card">
                      {/* Hero Image Block */}
                      <div className="pt-card-hero">
                        <img src={getGameImage(tourney.game?.title)} alt={tourney.game?.title} className="pt-card-img" />
                        <div className="pt-card-hero-overlay"></div>
                        <div className="pt-badge-entry">
                           ENTRY: {tourney.registrationFee > 0 ? `Rs ${tourney.registrationFee}` : "FREE"}
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
                              <span className="pt-stat-value-white">48/64</span>
                              <i className="fas fa-user-friends"></i>
                            </div>
                          </div>
                        </div>

                        <div className="pt-card-footer" style={{ justifyContent: 'flex-end' }}>
                          <button className="pt-card-action-btn pt-btn-outline">REGISTER NOW</button>
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
    </div>
  );
}
