import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("All fields are required");
      return;
    }
    console.log(email, password);
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
