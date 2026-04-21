import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gamepad2, Shield, Eye, EyeOff } from "lucide-react";
import "./Auth.css";
import { api } from "../../lib/api";

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "player" | "organizer" | "admin";
  };
};

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<"player" | "organizer">("player");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real-time validation
  const getEmailError = () => {
    if (!email) return "";
    if (!email.toLowerCase().endsWith("@gmail.com")) return "Must be a @gmail.com address";
    return "";
  };

  const getPasswordError = () => {
    if (!password) return "";
    if (password.length < 8) return "Must be at least 8 characters";
    return "";
  };

  const getConfirmError = () => {
    if (!confirmPassword) return "";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const isFormValid = 
    name.trim().length > 0 &&
    email.toLowerCase().endsWith("@gmail.com") &&
    password.length >= 8 &&
    password === confirmPassword &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) return;

    try {
      setLoading(true);

      const res = await api.post<RegisterResponse>("/auth/register", {
        fullName: name,
        email,
        password,
        role,
      });

      navigate('/login', { state: { message: "Account created successfully. Please log in." } });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ width: 420 }}>
        <h2>Create Account</h2>
        <p className="subtitle">Join the ultimate tournament platform.</p>

        {error && <div className="auth-error">{error}</div>}

        <label style={{ marginBottom: 6 }}>I am joining as a</label>
        <div className="auth-role-group">
          <button
            type="button"
            className={`auth-role-btn ${role === "player" ? "active" : ""}`}
            onClick={() => setRole("player")}
          >
            <Gamepad2 size={16} /> Player
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === "organizer" ? "active" : ""}`}
            onClick={() => setRole("organizer")}
          >
            <Shield size={16} /> Organizer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getEmailError() ? "input-error" : ""}
          />
          {getEmailError() && <span className="field-error">{getEmailError()}</span>}

          <label>Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={getPasswordError() ? "input-error" : ""}
            />
            <span className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
          </div>
          {getPasswordError() && <span className="field-error">{getPasswordError()}</span>}

          <label>Confirm Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={getConfirmError() ? "input-error" : ""}
            />
            <span className="auth-input-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
          </div>
          {getConfirmError() && <span className="field-error">{getConfirmError()}</span>}

          <div className="auth-checkbox-row">
            <input 
              type="checkbox" 
              id="agreeCheck" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agreeCheck">
              I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isFormValid} 
            style={{ 
              marginTop: 24,
              opacity: (loading || !isFormValid) ? 0.6 : 1,
              cursor: (loading || !isFormValid) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="switch" style={{ marginTop: 24 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
