import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";
import { api } from "../../lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ width: 420 }}>
          <h2>Password Reset Successful</h2>
          <div style={{ 
            background: 'rgba(34, 197, 94, 0.12)', 
            border: '1px solid rgba(34, 197, 94, 0.25)', 
            color: '#86efac', 
            padding: '16px', 
            borderRadius: '10px', 
            fontSize: '14px', 
            margin: '20px 0',
            textAlign: 'center'
          }}>
            Your password has been successfully reset. Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ width: 420 }}>
        <h2>Create New Password</h2>
        <p className="subtitle">Enter your new secure password below.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <div className="auth-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span className="auth-input-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
          </div>

          <label>Confirm New Password</label>
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

          <button type="submit" disabled={loading} style={{ marginTop: 24 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
