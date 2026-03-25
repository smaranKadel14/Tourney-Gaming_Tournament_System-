import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import "./PlayerHome.css";
import bg from "../../../assets/home/background.png";
import gamerImg from "../../../assets/home/gamer.png";
import valImg from "../../../assets/Tournaments/VAL.png";
import codImg from "../../../assets/Tournaments/COD.png";
import csImg from "../../../assets/Tournaments/CS.png";
import lolImg from "../../../assets/Tournaments/LOL.png";
import { Trophy, Zap, Facebook, Twitter, Linkedin } from "lucide-react";
import PlayerNavbar from "./PlayerNavbar";

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
  description: string;
  imageUrl: string;
  releaseDate: string;
  developer: string;
};

export default function PlayerHome() {
  const [featuredGame, setFeaturedGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGame = async () => {
      try {
        const response = await api.get('/games?featured=true');
        // Get the first featured game, if any
        if (response.data && response.data.length > 0) {
          setFeaturedGame(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching featured game:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedGame();
  }, []);

  return (
    <div className="ph">
      {/* Background image */}
      <div className="ph__bg" style={{ backgroundImage: `url(${bg})` }} />
      {/* Overlays */}
      <div className="ph__overlay" />

      <div className="ph__wrap">
        <PlayerNavbar />

        {/* HERO SECTION */}
        <section className="ph__hero">
          <div className="ph__hero-badges">
            <span className="ph__badge">🇳🇵 Made for Nepali Gamers</span>
          </div>
          <h1 className="ph__title">TOURNEY <span className="ph__title-highlight">NEPAL</span></h1>
          <p className="ph__subtitle">The Premier Esports Arena of the Himalayas</p>

          <div className="ph__hero-content">
            <div className="ph__hero-left">
              <div className="ph__image-wrapper">
                <img src={gamerImg} alt="Nepali Esports Gamer" />
                <div className="ph__image-glow"></div>
              </div>
            </div>
            
            <div className="ph__hero-right">
              <div className="ph__hero-block glass-panel">
                <div className="ph__block-icon"><Trophy size={28} color="#a200ff" /></div>
                <h2>Kathmandu<br/>Clash Series</h2>
                <p>
                  Join the most competitive weekend tournaments. Battle against top squads from all over Nepal for glory and exclusive prize pools.
                </p>
              </div>

              <div className="ph__hero-block glass-panel">
                <div className="ph__block-icon"><Zap size={28} color="#ffb800" /></div>
                <h2>Himalayan<br/>Showdown</h2>
                <p>
                  Monthly major events featuring massive prize pools. Prove your skills on the national stage and rise through the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED GAME SECTION */}
        <section className="ph__section">
          <div className="ph__sectionHead">
            <h2>TRENDING IN <span className="text-gradient">NEPAL</span></h2>
            <p>
              Explore the hottest games dominating the Nepali esports scene right now. Get ready to drop in and dominate.
            </p>
          </div>

          <div className="ph__featured-content">
            {loading ? (
              <p style={{ color: "white", width: "100%", textAlign: "center" }}>Loading featured game...</p>
            ) : featuredGame ? (
              <>
                <div className="ph__featured-left">
                  <img src={getGameImage(featuredGame.title)} alt={featuredGame.title} style={{ borderRadius: "10px", width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                
                <div className="ph__featured-right">
                  <h3 style={{ textTransform: "uppercase" }}>{featuredGame.title}</h3>
                  <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "20px", lineHeight: "1.6" }}>
                    {featuredGame.description}
                  </p>
                  
                  <div className="ph__meta-list">
                    <p><strong>Release Date:</strong> {new Date(featuredGame.releaseDate).toLocaleDateString()}</p>
                    <p><strong>Developer:</strong> {featuredGame.developer}</p>
                    <p><strong>Status:</strong> Available Now</p>
                  </div>

                  <button className="ph__btnPrimary">VIEW TOURNAMENTS</button>
                </div>
              </>
            ) : (
              <p style={{ color: "white", width: "100%", textAlign: "center" }}>No featured games available right now.</p>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ph__footer" id="contact">
          <div className="ph__social">
            <span className="social-icon"><Facebook size={20} /></span>
            <span className="social-icon"><Twitter size={20} /></span>
            <span className="social-icon"><Linkedin size={20} /></span>
          </div>
          <p className="ph__copyright">
            © {new Date().getFullYear()} TOURNEY NEPAL. PROUDLY BUILT FOR GAMERS IN NEPAL 🇳🇵.
            <br />ALL TRADEMARKS REFERENCED HEREIN ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS.
            <br />LEVEL UP YOUR GAME.
          </p>
        </footer>
      </div>
    </div>
  );
}
