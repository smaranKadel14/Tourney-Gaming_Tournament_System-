import PlayerNavbar from "./PlayerNavbar";
import "./Contact.css";

// Assets
import bg from "../../../assets/bg.png";

export default function Contact() {
  return (
    <div className="pc-page">
      {/* Background with Purple Glow */}
      <div className="pc-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="pc-overlay" />

      <div className="pc-wrap">
        <PlayerNavbar />

        {/* Hero Section */}
        <section className="pc-hero">
          <h1 className="pc-title">Get In Touch</h1>
          <p className="pc-subtitle">
            Need support regarding an ongoing tournament or have general inquiries?
            <br />Reach out to our administrative team and we will get back to you shortly.
          </p>
        </section>

        {/* Contact Layout Section */}
        <section className="pc-layout">
          {/* Left Column: Contact Info */}
          <div className="pc-info">
            
            <div className="pc-info-item">
              <div className="pc-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="pc-info-text">
                <p>500 Terry Francois St.</p>
                <p>San Francisco, CA 94158</p>
              </div>
            </div>

            <div className="pc-info-item">
              <div className="pc-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.03 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
              <div className="pc-info-text">
                <p className="pc-highlight">123-335-9958</p>
              </div>
            </div>

            <div className="pc-info-item">
              <div className="pc-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div className="pc-info-text">
                <p className="pc-highlight">contact@mysite.com</p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="pc-form">
            <div className="pc-form-row">
              <div className="pc-form-group">
                <label>First Name</label>
                <input type="text" className="pc-input" />
              </div>
              <div className="pc-form-group">
                <label>Last Name</label>
                <input type="text" className="pc-input" />
              </div>
            </div>
            
            <div className="pc-form-group">
              <label>Email*</label>
              <input type="email" className="pc-input" />
            </div>

            <div className="pc-form-group">
              <label>Message</label>
              <textarea className="pc-input pc-textarea"></textarea>
            </div>

            <div className="pc-form-submit">
              <button className="pc-btn">Send</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pc-footer">
          <div className="pc-socials">
            <span>f</span>
            <span>t</span>
            <span>G+</span>
          </div>
          <p className="pc-copyright">
            © 2026 NK GROUP INC. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. AND RELATED LOGOS ARE REGISTERED TRADEMARKS OR TRADEMARKS OF ID SOFTWARE LLC IN
            <br />THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
