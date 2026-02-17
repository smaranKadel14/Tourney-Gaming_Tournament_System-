import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  // I am keeping role selection (player/organizer)
  const [role, setRole] = useState<"player" | "organizer">("player");

  // I am keeping input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // I am keeping loading + error for feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Calling backend register API
      const res = await api.post<RegisterResponse>("/auth/register", {
        fullName: name,
        email,
        password,
        role,
      });

      // Saving auth
      saveAuth(res.data.token, res.data.user);

      // Redirect based on role
      navigate(roleHomePath(res.data.user.role));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join the ultimate tournament platform</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="role-switch">
          <button
            className={role === "player" ? "active" : ""}
            onClick={() => setRole("player")}
            type="button"
          >
            Player
          </button>
          <button
            className={role === "organizer" ? "active" : ""}
            onClick={() => setRole("organizer")}
            type="button"
          >
            Organizer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
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
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
