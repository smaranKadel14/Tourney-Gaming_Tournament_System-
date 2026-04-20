import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      
      await api.post("/auth/forgot-password", { email });
      
      setMessage("If an account exists for this email, a password reset link has been sent.");
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your email to receive recovery instructions</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="switch" style={{ marginTop: '24px' }}>
          Remembered your password? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
