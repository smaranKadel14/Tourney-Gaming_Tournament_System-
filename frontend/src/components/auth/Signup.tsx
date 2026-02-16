import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { setAuthUser } from "../../utils/auth";

const Signup = () => {
  const navigate = useNavigate(); // for redirect after signup

  const [role, setRole] = useState<"player" | "organizer">("player");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!name || !email || !password || !confirmPassword) {
      alert("All fields required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // temporary signup session save (backend will be added later)
    setAuthUser({ email, role });

    // redirect based on selected role
    if (role === "organizer") navigate("/organizer");
    else navigate("/player");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join the ultimate tournament platform</p>

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
            placeholder="At least 8 characters"
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

          <button type="submit">Create Account</button>
        </form>

        <p className="switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
