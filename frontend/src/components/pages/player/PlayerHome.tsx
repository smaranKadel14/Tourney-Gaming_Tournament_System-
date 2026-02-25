import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import "./PlayerHome.css";
import bg from "../../../assets/bg.png";
import gamerImg from "../../../assets/home/gamer.png";
import placeholderImg from "../../../assets/home/COD.png";
import PlayerNavbar from "./PlayerNavbar";

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
          <h1 className="ph__title">WEBSITE NAME</h1>
          <p className="ph__subtitle">Home Page</p>

          <div className="ph__hero-content">
            <div className="ph__hero-left">
              <img src={gamerImg} alt="Gamer" />
            </div>
            
            <div className="ph__hero-right">
              <div className="ph__hero-block">
                <h2>Hero Section<br/>FGF Playoff</h2>
                <p>
                  This is content
                </p>
              </div>

              <div className="ph__hero-block">
                <h2>Hero Section<br/>FGF Playoff</h2>
                <p>
                  This is content
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED GAME SECTION */}
        <section className="ph__section">
          <div className="ph__sectionHead">
            <h2>RELEASED <span>GAMES</span></h2>
            <p>
              Explore our top featured games that are currently taking the esports world by storm.
            </p>
          </div>

          <div className="ph__featured-content">
            {loading ? (
              <p style={{ color: "white", width: "100%", textAlign: "center" }}>Loading featured game...</p>
            ) : featuredGame ? (
              <>
                <div className="ph__featured-left">
                  {/* Using local asset as fallback if the URL is broken */}
                  <img src={placeholderImg} alt={featuredGame.title} style={{ borderRadius: "10px" }} />
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
            <span>f</span>
            <span>t</span>
            <span>G+</span>
          </div>
          <p className="ph__copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
