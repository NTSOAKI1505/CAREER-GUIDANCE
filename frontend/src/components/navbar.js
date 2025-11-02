// src/components/navbar.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout, loading } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch profile pic based on role
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !user) return;

      let endpoint = "";
      if (user.role === "student") endpoint = "/student/profile/me";
      else if (user.role === "institution") endpoint = "/institution/profile/me";
      else if (user.role === "company") endpoint = "/company/profile/me";

      if (!endpoint) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.profiles && data.profiles.length > 0) {
          setProfilePic(
            user.role === "student"
              ? data.profiles[0].profilePic || null
              : data.profiles[0].logoUrl || null // institution/company logo
          );
        }
      } catch (err) {
        console.error("Failed to fetch profile pic:", err);
      }
    };

    fetchProfile();
  }, [token, user]);

  if (loading) return <div className="navbar">Loading...</div>;

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src="/logo 1.png" alt="Logo" className="logo-img" />
        <span>CAREER-GUIDANCE & EMPLOYMENT</span>
      </div>

      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <button onClick={() => navigate("/")}>Home</button>
        </li>
      </ul>

      <div className="navbar-user">
        {user ? (
          <div className="profile" onClick={toggleProfile}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar">{user.firstName?.charAt(0)?.toUpperCase()}</div>
            )}
            <span>{user.firstName}</span>
            {profileOpen && (
              <div className="dropdown">
                {/* Redirect based on role */}
                {user.role === "student" && (
                  <button onClick={() => navigate("/studentprofile")}>Profile</button>
                )}
                {user.role === "institution" && (
                  <button onClick={() => navigate("/institutionprofile")}>Profile</button>
                )}
                {user.role === "company" && (
                  <button onClick={() => navigate("/companyprofile")}>Profile</button>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Signup</button>
          </div>
        )}
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
      </div>
    </nav>
  );
}

export default Navbar;
