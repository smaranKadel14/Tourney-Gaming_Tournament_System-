import { useState } from "react";
import PlayerNavbar from "./PlayerNavbar";
import { api } from "../../../lib/api";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import "./Contact.css";

// Assets
import bg from "../../../assets/bg.png";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setStatus("error");
      setStatusMsg("Please fill in all required fields.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await api.post("/contact", formData);
      setStatus("success");
      setStatusMsg(res.data.message);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: ""
      });
    } catch (err: any) {
      console.error("Contact submission error:", err);
      setStatus("error");
      setStatusMsg(err.response?.data?.message || "Failed to send message. Please try again later.");
    }
  };

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
                <MapPin size={32} color="#a200ff" />
              </div>
              <div className="pc-info-text">
                <p>Lazimpat, Kathmandu</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Corporate Headquarters</p>
              </div>
            </div>

            <div className="pc-info-item">
              <div className="pc-icon">
                <Phone size={32} color="#a200ff" />
              </div>
              <div className="pc-info-text">
                <p className="pc-highlight">+977-9801234567</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Mon - Fri, 9am - 6pm</p>
              </div>
            </div>

            <div className="pc-info-item">
              <div className="pc-icon">
                <Mail size={32} color="#a200ff" />
              </div>
              <div className="pc-info-text">
                <p className="pc-highlight">support@tourney.com</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Email Inquiry System</p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="pc-form">
            <form onSubmit={handleSubmit}>
              <div className="pc-form-row">
                <div className="pc-form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    className="pc-input" 
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="pc-form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    className="pc-input" 
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="pc-form-group" style={{ marginTop: '25px' }}>
                <label>Email Address*</label>
                <input 
                  type="email" 
                  name="email"
                  className="pc-input" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pc-form-group" style={{ marginTop: '25px' }}>
                <label>Your Message</label>
                <textarea 
                  name="message"
                  className="pc-input pc-textarea" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {status !== "idle" && (
                <div className={`pc-status-alert ${status}`}>
                  {status === "submitting" && <div className="spinner-inline"><Loader2 size={16} /> Sending...</div>}
                  {status === "success" && <div className="status-flex"><CheckCircle2 size={16} /> {statusMsg}</div>}
                  {status === "error" && <div className="status-flex"><AlertCircle size={16} /> {statusMsg}</div>}
                </div>
              )}

              <div className="pc-form-submit">
                <button type="submit" className="pc-btn" disabled={status === "submitting"}>
                  {status === "submitting" ? "Processing..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="pc-footer">
          <div className="pc-socials">
            <Facebook size={24} />
            <Twitter size={24} />
            <Instagram size={24} />
            <Linkedin size={24} />
          </div>
          <p className="pc-copyright">
            © 2026 TOURNEY NEPAL. DEVELOPED IN ASSOCIATION WITH LOREMINC, IPSUMCOMPANY, SITAMMETGROUP. CUMSIT AND RELATED
            <br />LOGOS ARE REGISTERED TRADEMARKS. ALL OTHER TRADEMARKS OR TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </div>
    </div>
  );
}
