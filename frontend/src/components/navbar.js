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

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!token || !user) return;

      let endpoint = "";
      if (user.role === "student") endpoint = "/student/profile/me";
      else if (user.role === "institution") endpoint = "/institution/profile/me";
      else if (user.role === "company") endpoint = "/company/profile/me";
      else if (user.role === "admin") endpoint = "/admin/profile/me";

      if (!endpoint) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          let profileData = data.profiles?.[0] || null;
          if (profileData) {
            let pic = null;
            if (user.role === "student" || user.role === "admin") pic = profileData.profilePic || null;
            else pic = profileData.logoUrl || null;

            setProfilePic(pic);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile pic:", err);
      }
    };

    fetchProfilePic();
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
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <button onClick={() => navigate("/")}>Institutions</button>
        </li>
      </ul>
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <button onClick={() => navigate("/")}>companies</button>
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
            <div className="user-info">
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <span className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
            {profileOpen && (
              <div className="dropdown">
                {/* Redirect based on role */}
                {user.role === "student" && <button onClick={() => navigate("/studentprofile")}>Profile</button>}
                {user.role === "institution" && <button onClick={() => navigate("/institutionprofile")}>Profile</button>}
                {user.role === "company" && <button onClick={() => navigate("/companyprofile")}>Profile</button>}
                {user.role === "admin" && <button onClick={() => navigate("/adminprofile")}>Profile</button>}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        )}
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
      </div>
    </nav>
  );
}

export default Navbar;
