import { Link, useLocation } from "react-router-dom";
import { clearAuthUser } from "../../../utils/auth";
import "./PlayerNavbar.css";

export default function PlayerNavbar() {
  const location = useLocation();

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  return (
    <header className="ph__nav">
      <div className="ph__logo">LOGO</div>

      <nav className="ph__links">
        <Link to="/player" className={location.pathname === "/player" ? "active" : ""}>Home</Link>
        <Link to="/player/tournaments" className={location.pathname === "/player/tournaments" ? "active" : ""}>Tournaments</Link>
        <Link to="/player/news" className={location.pathname === "/player/news" ? "active" : ""}>News</Link>
        <Link to="/player/contact" className={location.pathname === "/player/contact" ? "active" : ""}>Contact</Link>
      </nav>

      <div className="ph__actions">
        <button onClick={handleLogout} className="ph__logoutBtn">
          Logout
        </button>
        <span className="ph__lang">EN ▾</span>
      </div>
    </header>
  );
}
