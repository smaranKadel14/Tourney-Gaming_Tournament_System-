import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import './PlayerFooter.css';

const PlayerFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="player-footer">
      <div className="footer-glow"></div>
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">TOURNEY <span className="logo-highlight">NEPAL</span></h2>
            <p className="footer-tagline">The Premier Esports Arena of the Himalayas. Level up your game with us.</p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" className="social-link" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" className="social-link" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-links-column">
              <h3>Navigation</h3>
              <ul>
                <li><Link to="/player">Home</Link></li>
                <li><Link to="/player/tournaments">Tournaments</Link></li>
                <li><Link to="/player/news">News</Link></li>
                <li><Link to="/player/community">Community</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Support</h3>
              <ul>
                <li><Link to="/player/contact">Contact Us</Link></li>
                <li><Link to="/player/profile">My Profile</Link></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>

            <div className="footer-links-column contact-info">
              <h3>Get in Touch</h3>
              <ul>
                <li><MapPin size={16} /> <span>Lazimpat, Kathmandu</span></li>
                <li><Phone size={16} /> <span>+977-9801234567</span></li>
                <li><Mail size={16} /> <span>support@tourney.com</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} TOURNEY NEPAL. PROUDLY BUILT FOR GAMERS IN NEPAL 🇳🇵.
          </p>
          <p className="trademark">
            ALL TRADEMARKS REFERENCED HEREIN ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PlayerFooter;
