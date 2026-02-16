import { Link } from "react-router-dom";
import "./PlayerHome.css";
import bg from "../../../assets/bg.png";

export default function PlayerHome() {
  // Dummy data (later from backend)
  const tournaments = [
    {
      id: "t1",
      title: "Valorant Weekly Cup",
      date: "Aug 12, 2028 • 6:00 PM",
      location: "Online",
      status: "Open",
    },
    {
      id: "t2",
      title: "FIFA Knockout Series",
      date: "Aug 16, 2028 • 4:00 PM",
      location: "Online",
      status: "Coming Soon",
    },
    {
      id: "t3",
      title: "PUBG Squad Battle",
      date: "Aug 20, 2028 • 9:00 PM",
      location: "Kathmandu",
      status: "Open",
    },
  ];

  return (
    <div className="ph">
      {/* Background image */}
      <div className="ph__bg" style={{ backgroundImage: `url(${bg})` }} />
      {/* Overlays */}
      <div className="ph__overlay" />

      <div className="ph__wrap">
        {/* NAVBAR */}
        <header className="ph__nav">
          <div className="ph__logo">LOGO</div>

          <nav className="ph__links">
            <a href="#home" className="active">Home</a>
            <a href="#tournaments">Tournaments</a>
            <a href="#news">News</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="ph__actions">
            <span className="ph__lang">EN ▾</span>
          </div>
        </header>

        {/* HERO */}
        <section className="ph__hero" id="home">
          <h1 className="ph__title">TOURNEY</h1>
          <p className="ph__subtitle">Join tournaments. Compete. Climb ranks.</p>

          <div className="ph__heroGrid">
            {/* Left image block */}
            <div className="ph__panel ph__imagePanel">
              <div className="ph__imageFrame" />
            </div>

            {/* Right text block */}
            <div className="ph__panel ph__textPanel">
              <h2>FGF Playoff</h2>
              <p>
                Discover featured events, register quickly, and track your progress.
                This dashboard shows tournaments that match your interests.
              </p>

              <div className="ph__divider" />

              <h2>How it works</h2>
              <p>
                Browse tournaments → open details → register → receive confirmation.
                After backend integration, you’ll also see your registered tournaments
                and match updates here.
              </p>

              <div className="ph__quickActions">
                <button className="ph__btnPrimary">Browse Tournaments</button>
                <button className="ph__btnGhost">My Registrations</button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="ph__section" id="tournaments">
          <div className="ph__sectionHead">
            <h2>
              RELEASED <span>GAMES</span>
            </h2>
            <p>Featured tournaments available for registration.</p>
          </div>

          <div className="ph__featured">
            <div className="ph__poster" />

            <div className="ph__featuredInfo">
              <h3>CALL OF DUTY</h3>

              <p className="ph__meta">
                Tournament Info: <b>Aug 8, 2028</b>, 10pm, Los Angeles
              </p>
              <p className="ph__meta">
                Register Until: <b>Aug 6, 2028</b>, 8am
              </p>

              <ul className="ph__bullets">
                <li>Solo / Duo / Squad formats supported</li>
                <li>Bracket + results tracking (later)</li>
                <li>Organizer announcements (later)</li>
              </ul>

              <button className="ph__btnPrimary">REGISTER NOW</button>
            </div>
          </div>

          {/* UPCOMING LIST */}
          <div className="ph__listHead">
            <h3>Upcoming Tournaments</h3>
            <input className="ph__search" placeholder="Search tournament..." />
          </div>

          <div className="ph__list">
            {tournaments.map((t) => (
              <div className="ph__card" key={t.id}>
                <div>
                  <h4>{t.title}</h4>
                  <p className="ph__small">
                    {t.date} • {t.location}
                  </p>
                  <span className={`ph__tag ${t.status === "Open" ? "open" : "soon"}`}>
                    {t.status}
                  </span>
                </div>

                {/* later: Link to tournament details */}
                <Link to="#" className="ph__view">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ph__footer" id="contact">
          <p>© 2026 Tourney Gaming Tournament System</p>
          <div className="ph__social">
            <span>f</span>
            <span>t</span>
            <span>g+</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
