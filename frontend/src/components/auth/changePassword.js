import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./login.css"; // Reuse login styles

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const { token, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.newPassword !== form.newPasswordConfirm) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Password change failed");

      // Show success message
      setSuccess("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });

      // ✅ Auto logout after 2 seconds for security
      setTimeout(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Change Password</h1>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Success Message (green) */}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="newPasswordConfirm"
          placeholder="Confirm New Password"
          value={form.newPasswordConfirm}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
