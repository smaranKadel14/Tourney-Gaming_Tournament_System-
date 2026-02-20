import PlayerNavbar from "./PlayerNavbar";
import "./News.css";

// Assets
import bg from "../../../assets/bg.png";
import newsImg from "../../../assets/news/News.png";

export default function News() {
  // Creating an array of 4 items to simulate the list in the Figma design
  const newsList = [1, 2, 3, 4];

  return (
    <div className="pn-page">
      {/* Background with Purple Glow */}
      <div className="pn-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pn-overlay" />

      <div className="pn-wrap">
        <PlayerNavbar />

        {/* Hero Section */}
        <section className="pn-hero">
          <h1 className="pn-title">See News In Your Company</h1>
          <p className="pn-subtitle">
            This is News.
            <br />This is News.
          </p>
        </section>

        {/* News Feed Section */}
        <section className="pn-feed">
          <div className="pn-feed-container">
            {newsList.map((item) => (
              <div key={item} className="pn-news-card" style={{ backgroundImage: `url(${newsImg})` }}>
                <div className="pn-news-content">
                  <h2 className="pn-news-headline">Start create your vision</h2>
                  <p className="pn-news-text">
                    This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News. This is News.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pn-footer">
          <p className="pn-copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
