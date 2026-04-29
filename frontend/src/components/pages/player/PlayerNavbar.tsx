import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { clearAuthUser } from "../../../utils/auth";
import { Menu, X } from "lucide-react";
import "./PlayerNavbar.css";

export default function PlayerNavbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="ph__nav">
      <div className="ph__logo">TOURNEY</div>

      <nav className={`ph__links ${isOpen ? "ph__links--open" : ""}`}>
        <Link to="/player" className={location.pathname === "/player" ? "active" : ""} onClick={closeMenu}>Home</Link>
        <Link to="/player/tournaments" className={location.pathname === "/player/tournaments" ? "active" : ""} onClick={closeMenu}>Tournaments</Link>
        <Link to="/player/news" className={location.pathname === "/player/news" ? "active" : ""} onClick={closeMenu}>News</Link>
        <Link to="/player/community" className={location.pathname.startsWith("/player/community") ? "active" : ""} onClick={closeMenu}>Community</Link>
        <Link to="/player/contact" className={location.pathname === "/player/contact" ? "active" : ""} onClick={closeMenu}>Contact</Link>
      </nav>

      <div className="ph__actions">
        <Link to="/player/profile" className={`ph__profile-link ${location.pathname === "/player/profile" ? "active" : ""}`} title="Profile" onClick={closeMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </Link>
        <button onClick={handleLogout} className="ph__logoutBtn" title="Logout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
        <button className="ph__hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
}
