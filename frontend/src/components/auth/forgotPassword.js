import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./login.css"; // Reuse login styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");

  // ✅ Ensure backend URL is defined
  useEffect(() => {
    if (!process.env.REACT_APP_BACKEND_URL) {
      console.error("REACT_APP_BACKEND_URL is not defined in .env");
      setError("Backend URL not configured. Contact admin.");
    } else {
      setBackendUrl(process.env.REACT_APP_BACKEND_URL);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!backendUrl) return; // Stop if backend URL is missing

    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Parse JSON safely
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Invalid server response: ${res.status}`);
      }

      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      setMessage(data.message || "Reset link sent successfully");
      console.log("Reset token (for testing):", data.resetToken);

    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Forgot Password</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
            setMessage("");
          }}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading || !backendUrl}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
