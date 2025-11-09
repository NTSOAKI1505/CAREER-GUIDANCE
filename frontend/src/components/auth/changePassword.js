import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./login.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // ✅ Grab token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setStatus({ error: "You are not logged in", success: "" });
      // Redirect to login after 1.5s
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    const { currentPassword, newPassword, newPasswordConfirm } = form;

    // Validation
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setStatus({ error: "All fields are required", success: "" });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setStatus({ error: "New passwords do not match", success: "" });
      return;
    }

    if (!token) {
      setStatus({ error: "Token missing or expired. Please log in again.", success: "" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Password change failed");

      setStatus({ success: "Password updated successfully!", error: "" });
      setForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });

      // Auto logout after 2 seconds
      setTimeout(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
        window.location.reload();
      }, 2000);
    } catch (err) {
      setStatus({ error: err.message, success: "" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Change Password</h1>

      {status.error && <p className="error">{status.error}</p>}
      {status.success && <p className="success-message">{status.success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          required
          disabled={loading || !token}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
          disabled={loading || !token}
        />
        <input
          type="password"
          name="newPasswordConfirm"
          placeholder="Confirm New Password"
          value={form.newPasswordConfirm}
          onChange={handleChange}
          required
          disabled={loading || !token}
        />
        <button type="submit" disabled={loading || !token}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
