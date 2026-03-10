import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gamepad2, Shield, Eye, EyeOff } from "lucide-react";
import "./Auth.css";
import { api } from "../../lib/api";
import { saveAuth, roleHomePath } from "../../utils/auth";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms and Privacy Policy");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post<RegisterResponse>("/auth/register", {
        fullName: name,
        email,
        password,
        role,
      });

      saveAuth(res.data.token, res.data.user);
      navigate(roleHomePath(res.data.user.role));
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
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span className="auth-input-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
          </div>

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

          <button type="submit" disabled={loading} style={{ marginTop: 24 }}>
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
