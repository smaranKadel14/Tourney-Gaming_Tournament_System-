import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { api } from "../../lib/api";
import { saveAuth, roleHomePath } from "../../utils/auth";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "player" | "organizer" | "admin";
  };
};

const Login = () => {
  const navigate = useNavigate();

  // I am keeping state for email/password input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // I am keeping loading + error for better feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // Calling backend login API
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Saving token + user in localStorage
      saveAuth(res.data.token, res.data.user);

      // Redirecting based on role
      navigate(roleHomePath(res.data.user.role));
    } catch (err: any) {
      // Showing backend error message if available
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back, Gamer</h2>
        <p className="subtitle">Sign in to access your dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="switch">
          New to the arena? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
