// src/components/ResetPassword.js
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./login.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ResetPassword = () => {
  const { token } = useParams(); // token comes from URL: /reset-password/:token
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, newPasswordConfirm }),
      });

      const data = await res.json();

      if (data.status !== "success") throw new Error(data.message || "Error resetting password");

      setMessage(data.message);

      // Optional: redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Reset Password</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
