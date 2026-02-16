import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { setAuthUser } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate(); // for page redirection after login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    // temporary login logic (until backend auth is connected)
    // if email contains "admin" -> admin
    // if email contains "org" -> organizer
    // else -> player
    const role = email.includes("admin")
      ? "admin"
      : email.includes("org")
      ? "organizer"
      : "player";

    // saving login session to localStorage
    setAuthUser({ email, role });

    // role based redirection
    if (role === "admin") navigate("/admin");
    else if (role === "organizer") navigate("/organizer");
    else navigate("/player");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back, Gamer</h2>
        <p className="subtitle">Sign in to access your dashboard</p>

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

          <button type="submit">Log In</button>
        </form>

        <p className="switch">
          New to the arena? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
