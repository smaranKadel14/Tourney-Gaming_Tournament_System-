import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import PlayerNavbar from "./PlayerNavbar";
import "./News.css";

// Assets
import bg from "../../../assets/bg.png";
import placeholderImg from "../../../assets/news/News.png";

type NewsItem = {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
};

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news');
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

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
            Stay up to date with the latest patches
            <br />and tournament results.
          </p>
        </section>

        {/* News Feed Section */}
        <section className="pn-feed">
          <div className="pn-feed-container">
            {loading ? (
              <p style={{ color: "white", textAlign: "center" }}>Loading news...</p>
            ) : news.length === 0 ? (
              <p style={{ color: "white", textAlign: "center" }}>No news found.</p>
            ) : (
              news.map((item) => (
                <div 
                  key={item._id} 
                  className="pn-news-card" 
                  style={{ backgroundImage: `url(${placeholderImg})` }}
                >
                  <div className="pn-news-content">
                    <h2 className="pn-news-headline">{item.title}</h2>
                    <p className="pn-news-text">{item.content}</p>
                  </div>
                </div>
              ))
            )}
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
