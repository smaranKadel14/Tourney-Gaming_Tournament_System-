import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import "./TournamentDetails.css";
import { getToken, getAuthUser } from "../../../utils/auth";
import bg from "../../../assets/bg.png";

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
  maxParticipants: number;
  imageUrl: string;
  status: "upcoming" | "ongoing" | "completed";
};

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Check URL params for payment success/failure from eSewa redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
       setMessage("Payment successful! You are now registered for this tournament.");
       // Clean up URL
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data);
      } catch (err: any) {
        console.error("Error fetching tournament:", err);
        setError("Failed to load tournament details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
       fetchTournament();
    }
  }, [id]);

  const handleRegister = async () => {
    const token = getToken();
    const user = getAuthUser();

    if (!token || !user) {
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    setError("");
    setMessage("");

    try {
      // If there's a fee, initiate eSewa payment
      if (tournament?.registrationFee && tournament.registrationFee > 0) {
          const res = await fetch(`http://localhost:5000/api/tournaments/${id}/esewa-payment`, {
             method: 'POST',
             headers: {
                 'Authorization': `Bearer ${token}`
             }
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
  
  const canRegister = !isPastDeadline && !isSetupComplete;

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
            <header className="td-banner" style={{ backgroundImage: `url(${tournament.imageUrl})` }}>
              <div className="td-banner-overlay">
                <span className={`td-status ${tournament.status}`}>{tournament.status}</span>
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
            </div>
          </main>

          <aside className="td-sidebar">
            <div className="td-card">
              {message && <div className="td-message success">{message}</div>}
              {error && <div className="td-message error">{error}</div>}

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
                  onClick={handleRegister}
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
                <button className="td-register-btn" disabled>
                  {isSetupComplete ? "Tournament Ended" : "Registration Closed"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
