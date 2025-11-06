import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON. Check BACKEND_URL.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Save user and token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect based on user role
      if (data.user.role === "student") {
        navigate("/studentprofile");
      } else if (data.user.role === "institution") {
        navigate("/institutionprofile"); // still keeping the route `/instituteprofile`
      } else if (data.user.role === "company") {
        navigate("/companyprofile");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Signup</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <input
          type="password"
          name="passwordConfirm"
          placeholder="Confirm Password"
          value={form.passwordConfirm}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          disabled={loading}
          required
        >
          <option value="student">Student</option>
          <option value="institution">Institution</option>
          <option value="company">Company</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
