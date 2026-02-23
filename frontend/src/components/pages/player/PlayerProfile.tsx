import { useState } from "react";
import PlayerNavbar from "./PlayerNavbar";
import "./PlayerProfile.css";

// Assets
import bg from "../../../assets/bg.png";
import defAvatar from "../../../assets/home/gamer.png"; // Reusing an asset for a dummy avatar

export default function PlayerProfile() {
  const [avatar, setAvatar] = useState<string | null>(defAvatar);

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const handleUploadAvatar = () => {
    // In a real app this would open a file picker
    alert("Upload functionality to be implemented in backend phase");
  };

  return (
    <div className="pp-page">
      {/* Background with Purple Glow */}
      <div className="pp-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pp-overlay" />

      <div className="pp-wrap">
        <PlayerNavbar />

        <div className="pp-content">
          {/* 1. Profile Identity Header */}
          <section className="pp-header">
            <div className="pp-avatar-wrapper">
              <div 
                className="pp-avatar" 
                style={{ backgroundImage: avatar ? `url(${avatar})` : 'none' }}
              >
                {!avatar && <div className="pp-avatar-placeholder">?</div>}
                
                <div className="pp-avatar-overlay">
                  <button className="pp-btn-icon" onClick={handleUploadAvatar} title="Upload New">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                  </button>
                  {avatar && (
                    <button className="pp-btn-icon pp-btn-danger" onClick={handleRemoveAvatar} title="Remove">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pp-identity">
              <h1 className="pp-username">Xx_SniperKing_xX</h1>
              <span className="pp-email">sniperking@example.com</span>
              <p className="pp-bio">
                Casual competitive player. Love battle royales and tactical shooters. Looking for a squad for the upcoming Summer Championship!
              </p>
              <button className="pp-btn-edit">Edit Profile</button>
            </div>
          </section>

          {/* 2. Quick Statistics */}
          <section className="pp-stats">
            <div className="pp-stat-card">
              <div className="pp-stat-value">14</div>
              <div className="pp-stat-label">Tournaments Played</div>
            </div>
            <div className="pp-stat-card">
              <div className="pp-stat-value">65%</div>
              <div className="pp-stat-label">Overall Win Rate</div>
            </div>
            <div className="pp-stat-card">
              <div className="pp-stat-value" style={{ fontSize: "28px" }}>Valorant</div>
              <div className="pp-stat-label">Favorite Game</div>
            </div>
          </section>

          <div className="pp-grid">
            {/* 3. Tournament History */}
            <section className="pp-history">
              <h2 className="pp-section-title">Tournament History</h2>
              <div className="pp-table-container">
                <table className="pp-table">
                  <thead>
                    <tr>
                      <th>Tournament Name</th>
                      <th>Game</th>
                      <th>Date</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Winter Cash Cup</td>
                      <td>Valorant</td>
                      <td>Dec 15, 2025</td>
                      <td><span className="pp-badge pp-badge-win">1st Place</span></td>
                    </tr>
                    <tr>
                      <td>Global Royale Open</td>
                      <td>Call of Duty: Warzone</td>
                      <td>Oct 02, 2025</td>
                      <td><span className="pp-badge pp-badge-loss">Eliminated (Round 2)</span></td>
                    </tr>
                    <tr>
                      <td>Weekly Clash</td>
                      <td>League of Legends</td>
                      <td>Sep 19, 2025</td>
                      <td><span className="pp-badge pp-badge-win">Semi-Finalist</span></td>
                    </tr>
                    <tr>
                      <td>CS:GO Local Qualifiers</td>
                      <td>CS:GO</td>
                      <td>Aug 11, 2025</td>
                      <td><span className="pp-badge pp-badge-loss">Eliminated (Groups)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Achievements Showcase */}
            <section className="pp-achievements">
              <h2 className="pp-section-title">Achievements</h2>
              <div className="pp-achievements-grid">
                
                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #FFD700, #FDB931)" }}>
                    🏆
                  </div>
                  <span className="pp-achievement-label">Champion</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #a200ff, #ff007f)" }}>
                    🚀
                  </div>
                  <span className="pp-achievement-label">Beta Tester</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #ff4e50, #f9d423)" }}>
                    🔥
                  </div>
                  <span className="pp-achievement-label">First Blood</span>
                </div>

                <div className="pp-achievement-card">
                  <div className="pp-achievement-icon" style={{ background: "linear-gradient(135deg, #00c6ff, #0072ff)" }}>
                    ❄️
                  </div>
                  <span className="pp-achievement-label">Ice Cold</span>
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pp-footer">
          <p className="pp-copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
