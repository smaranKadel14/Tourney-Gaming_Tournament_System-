import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import "./TournamentDetails.css";
import { getToken, getAuthUser } from "../../../utils/auth";
import bg from "../../../assets/bg.png";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";

const ReadOnlySeed = ({ seed }: any) => {
  const isTeam1Winner = seed.teams[0]?.status === "W";
  const isTeam2Winner = seed.teams[1]?.status === "W";

  return (
    <Seed mobileBreakpoint={768} style={{ fontSize: 13, padding: '1rem' }}>
      <SeedItem style={{background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '220px'}}>
        <div>
          <SeedTeam style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: isTeam1Winner ? 'rgba(74, 222, 128, 0.15)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
             <span style={{ fontWeight: isTeam1Winner ? 700 : 500, color: isTeam1Winner ? '#4ade80' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {seed.teams[0]?.name || "TBD"}
             </span>
             <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{color: '#94a3b8', fontSize: '11px'}}>{seed.teams[0]?.score}</span>
                {seed.teams[0]?.status && <span style={{color: isTeam1Winner ? '#4ade80' : '#ef4444', fontWeight: 'bold'}}>{seed.teams[0]?.status}</span>}
             </div>
          </SeedTeam>
          
          <SeedTeam style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: isTeam2Winner ? 'rgba(74, 222, 128, 0.15)' : 'transparent' }}>
             <span style={{ fontWeight: isTeam2Winner ? 700 : 500, color: isTeam2Winner ? '#4ade80' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {seed.teams[1]?.name || "TBD"}
             </span>
             <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{color: '#94a3b8', fontSize: '11px'}}>{seed.teams[1]?.score}</span>
                {seed.teams[1]?.status && <span style={{color: isTeam2Winner ? '#4ade80' : '#ef4444', fontWeight: 'bold'}}>{seed.teams[1]?.status}</span>}
             </div>
          </SeedTeam>
        </div>
      </SeedItem>
    </Seed>
  );
};
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

type Tournament = {
  _id: string;
  title: string;
  game: {
    _id: string;
    title: string;
  };
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationDeadline: string;
  prizePool: string;
  rules: string;
  registrationFee: number;
  imageUrl: string;
  status: "upcoming" | "ongoing" | "completed";
  teamSize: number;
  bracketData?: any[];
};

type UserTeam = {
  _id: string;
  name: string;
  logoUrl?: string;
};

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);

  // Check URL params for payment success/failure from eSewa redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentResult = urlParams.get('payment');
    
    if (paymentResult === 'success') {
       setMessage("Payment successful! You are now registered for this tournament.");
       // Clean up URL
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchTournamentAndStatus = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data);

        // If user is logged in, check their registration status
        const token = getToken();
        const user = getAuthUser();
        if (token) {
           const regRes = await api.get(`/tournaments/${id}/registration-status`, {
               headers: { Authorization: `Bearer ${token}` }
           });
           if (regRes.data && regRes.data.isRegistered) {
               setIsRegistered(true);
           }

           // Fetch user teams if this is a team tournament
           if (response.data.teamSize > 1) {
              const teamsRes = await api.get('/teams', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              // Filter teams where user is captain
              const captained = teamsRes.data.filter((t: any) => t.captain._id === user?.id);
              setUserTeams(captained);
           }
        }
      } catch (err: any) {
        console.error("Error fetching tournament:", err);
        setError("Failed to load tournament details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
       fetchTournamentAndStatus();
    }
  }, [id]);

  const handleRegister = async (teamIdToUse?: string) => {
    const token = getToken();
    const user = getAuthUser();

    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Enforce Team Selection
    if (!teamIdToUse) {
        if (userTeams.length === 0) {
            setError("You need to lead a team to join this tournament. Create one in the Community Hub!");
            return;
        }
        setShowTeamModal(true);
        return;
    }

    setIsRegistering(true);
    setShowTeamModal(false);
    setError("");
    setMessage("");

    try {
      // If there's a fee, initiate eSewa payment
      if (tournament?.registrationFee && tournament.registrationFee > 0) {
          const res = await fetch(`http://localhost:5000/api/tournaments/${id}/esewa-payment`, {
             method: 'POST',
             headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({ teamId: teamIdToUse })
          });
          
          const data = await res.json();
          
          if (!res.ok) {
              throw new Error(data.message || "Failed to initiate payment");
          }

          if (data.paymentUrl && data.esewaPayload) {
              // Create a form dynamically and submit it to eSewa
              const form = document.createElement('form');
              form.setAttribute('method', 'POST');
              form.setAttribute('action', data.paymentUrl);

              for (const key in data.esewaPayload) {
                  const hiddenField = document.createElement('input');
                  hiddenField.setAttribute('type', 'hidden');
                  hiddenField.setAttribute('name', key);
                  hiddenField.setAttribute('value', data.esewaPayload[key]);
                  form.appendChild(hiddenField);
              }

              document.body.appendChild(form);
              form.submit();
          } else {
              throw new Error("Invalid payment payload received.");
          }

      } else {
        // Standard free registration
        const res = await fetch(`http://localhost:5000/api/tournaments/${id}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId: teamIdToUse })
        });

        const data = await res.json();
        if (res.ok) {
          setMessage("Successfully registered for tournament!");
        } else {
          setError(data.message || "Failed to register");
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return <div className="td-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><h2>Loading...</h2></div>;
  if (error && !tournament) return <div className="td-page" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><h2 style={{color: 'red'}}>{error}</h2></div>;
  if (!tournament) return null;

  const isFree = !tournament.registrationFee || tournament.registrationFee <= 0;
  const isPastDeadline = new Date() > new Date(tournament.registrationDeadline);
  const isSetupComplete = tournament.status === "completed";
  
  let displayStatus = tournament.status;
  if (displayStatus === "upcoming" && isPastDeadline) {
      displayStatus = "ongoing";
  }

  const fullyRegistered = isRegistered;
  const canRegister = !isPastDeadline && !isSetupComplete && !fullyRegistered;

  return (
    <div className="td-page">
      <div className="td-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="td-overlay" />

      <div className="td-wrap">

        <button className="td-back" onClick={() => navigate('/player/tournaments')}>
          ← Back to Tournaments
        </button>

        <div className="td-content">
          <main className="td-main">
            <header className="td-banner" style={{ backgroundImage: `url(${getGameImage(tournament.game?.title)})` }}>
              <div className="td-banner-overlay">
                <span className={`td-status ${displayStatus}`}>{displayStatus}</span>
                <h1 className="td-title">{tournament.title}</h1>
                <p className="td-game">{tournament.game?.title}</p>
              </div>
            </header>

            <div className="td-body">
              <section className="td-section">
                <h3>Description</h3>
                <p className="td-desc">{tournament.description}</p>
              </section>

              {tournament.rules && (
                <section className="td-section">
                  <h3>Rules</h3>
                  <div className="td-desc" style={{ whiteSpace: 'pre-line' }}>{tournament.rules}</div>
                </section>
              )}

              {tournament.bracketData && tournament.bracketData.length > 0 && (
                <section className="td-section">
                  <h3>Tournament Bracket</h3>
                  <div className="td-bracket-wrap" style={{ overflowX: 'auto', padding: '1rem 0' }}>
                     <Bracket 
                        rounds={tournament.bracketData} 
                        renderSeedComponent={(props) => <ReadOnlySeed seed={props.seed} />}
                     />
                  </div>
                </section>
              )}
            </div>
          </main>

          <aside className="td-sidebar">
            <div className="td-card">
              {message && <div className="td-message success">{message}</div>}
              {error && <div className="td-message error">{error}</div>}

              <div className="td-info-item">
                <span className="td-info-label">Tournament Format</span>
                <span className="td-info-value">Team ({tournament.teamSize || 5}v{tournament.teamSize || 5})</span>
              </div>
              
              <div className="td-info-item">
                <span className="td-info-label">Prize Pool</span>
                <span className="td-info-value td-prize">{tournament.prizePool}</span>
              </div>
              
              <div className="td-info-item">
                <span className="td-info-label">Registration Fee</span>
                <span className={`td-info-value ${isFree ? 'td-prize' : 'td-fee'}`}>
                  {isFree ? 'FREE' : `Rs. ${tournament.registrationFee}`}
                </span>
              </div>

              <div className="td-info-item">
                <span className="td-info-label">Start Date</span>
                <span className="td-info-value">
                  {new Date(tournament.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="td-info-item">
                <span className="td-info-label">Location</span>
                <span className="td-info-value">{tournament.location}</span>
              </div>

              <div className="td-info-item" style={{ borderBottom: 'none'}}>
                <span className="td-info-label">Registration Closes</span>
                <span className="td-info-value">
                  {new Date(tournament.registrationDeadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {canRegister ? (
                <button 
                  className={`td-register-btn ${!isFree ? 'esewa' : 'standard'}`} 
                  onClick={() => handleRegister()}
                  disabled={isRegistering}
                >
                  {!isFree && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
                      <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z" fill="white"/>
                    </svg>
                  )}
                  {isRegistering ? "Processing..." : isFree ? "Register Now" : "Pay with eSewa"}
                </button>
              ) : (
                <button className="td-register-btn" disabled style={fullyRegistered ? {background: '#22c55e', opacity: 1} : {}}>
                  {fullyRegistered ? "✓ You are Registered" : isSetupComplete ? "Tournament Ended" : "Registration Closed"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Team Selection Modal */}
      {showTeamModal && (
        <div className="comm-modal-overlay">
          <div className="comm-modal">
            <h2>Select Your Team</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This is a team tournament. Select which team you want to lead into battle.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userTeams.map(team => (
                    <button 
                        key={team._id} 
                        className={`tm-tab ${selectedTeamId === team._id ? 'tm-tab--active' : ''}`}
                        style={{ padding: '15px', borderRadius: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #334155' }}
                        onClick={() => setSelectedTeamId(team._id)}
                    >
                        <div style={{ width: 40, height: 40, background: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                            {team.logoUrl && <img src={`http://localhost:5000${team.logoUrl}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                        </div>
                        <span style={{ color: 'white', fontWeight: 600 }}>{team.name}</span>
                    </button>
                ))}
            </div>
            <div className="comm-modal-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="comm-btn-cancel" onClick={() => setShowTeamModal(false)}>Cancel</button>
              <button 
                  className="comm-btn" 
                  disabled={!selectedTeamId}
                  onClick={() => handleRegister(selectedTeamId)}
              >
                  Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
