import PlayerNavbar from "./PlayerNavbar";
import "./Tournaments.css";

// Assets
import bg from "../../../assets/bg.png";
import lolImg from "../../../assets/Tournaments/LOL.png";
import codImg from "../../../assets/Tournaments/COD.png";
import valImg from "../../../assets/Tournaments/VAL.png";
import csImg from "../../../assets/Tournaments/CS.png";

const GAMES = [
  { id: 1, name: "LEAGUE OF LEGENDS", imgUrl: lolImg },
  { id: 2, name: "CALL OF DUTY", imgUrl: codImg },
  { id: 3, name: "VALORANT", imgUrl: valImg },
  { id: 4, name: "CS:GO", imgUrl: csImg },
];

export default function Tournaments() {
  return (
    <div className="pt-page">
      {/* Background with Purple Glow */}
      <div className="pt-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pt-overlay" />

      <div className="pt-wrap">
        <PlayerNavbar />

        {/* Hero Section */}
        <section className="pt-hero">
          <h1 className="pt-title">RELEASED <span>TOURNAMENTS</span></h1>
          <p className="pt-subtitle">
            Lorem Ipsum Dolor Sit Amet, Consectetuer Adipiscing Elit. Itaque Earum Rerum Hic Tenetur A Sapiente Delectus, Ut Aut
            <br />Reiciendis Voluptatibus Maiores Alias Consequatur Aut Perferendis Doloribus Asperiores Repellat.
          </p>
        </section>

        {/* Games Section */}
        <section className="pt-gamesbg">
          <div className="pt-games-container">
            <h2 className="pt-section-title">PICK YOUR GAME</h2>
            <p className="pt-section-subtitle">P I C K Y O U R G A M E</p>

            <div className="pt-games-grid">
              {GAMES.map((game) => (
                <div key={game.id} className="pt-game-card">
                  <div 
                    className="pt-game-image" 
                    style={{ backgroundImage: `url(${game.imgUrl})` }} 
                  />
                  <div className="pt-game-name-overlay">
                    {game.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="pt-partners">
          <h2 className="pt-partners-title">Our Trusted Partners</h2>
          <p className="pt-partners-subtitle">Lorem Ipsum La Dorlor Si Van</p>

          <div className="pt-partners-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="pt-partner-col">
                <div className="pt-partner-logo">
                  {/* Placeholder SVG logo for ROG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22h20L12 2zm0 4.2L18.8 19H5.2L12 6.2z"/>
                  </svg>
                  <div className="pt-partner-brand">
                    <span>REPUBLIC OF</span>
                    <strong>GAMERS</strong>
                  </div>
                </div>
                <p className="pt-partner-desc">
                  Lorem Ipsum Dolor Sit Amet, Consectetuer Adipiscing Elit. Nulla
                  Non Arcu Lacinia Neque Faucibus Fringilla. Nulla Est. Fusce Tellus
                  Odio, Dapibus Id Fermentum Quis, Suscipit Id Erat. Nullam Eget
                  Nisl. Integer Imperdiet Lectus Quis Justo. Duis Bibendum, Lectus
                  Ut Viverra Rhoncus,
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-footer">
          <div className="pt-socials">
            <span>f</span>
            <span>t</span>
            <span>G+</span>
          </div>
          <p className="pt-copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
