import { clearAuthUser } from "../../../utils/auth";
import "./PlayerNavbar.css";

export default function PlayerNavbar() {
  const handleLogout = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  return (
    <header className="ph__nav">
      <div className="ph__logo">LOGO</div>

      <nav className="ph__links">
        <a href="#home" className="active">Home</a>
        <a href="#tournaments">Tournaments</a>
        <a href="#news">News</a>
        <a href="#contact">Contact</a>
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
