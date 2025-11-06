import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./navbar.css";

const roleLinks = {
  student: [
    { label: "Admissions", path: "/studentadmissions" },
    { label: "Institutions", path: "/studentapplications" },
    { label: "Jobs", path: "/jobs" },
    { label: "Companies", path: "/Companies" },
    { label: "Doc", path: "/Doc" },
  ],
  institution: [
    { label: "Faculties & Courses", path: "/faculties" },
    { label: "Applications", path: "/institutionapplications" },
    { label: "Admissions", path: "/institutionadmissions" },
    { label: "Jobs", path: "/jobs" },
  ],
  company: [
    { label: "Post_Jobs", path: "/PostJobs" },
    { label: "Job Applications", path: "/jobapplications" },
    { label: "Alumni", path: "/Alumni" },
  ],
  admin: [
    { label: "Institutions", path: "/admin/institutions" },
    { label: "Companies", path: "/admin/companies" },
    { label: "Users", path: "/admin/users" },
    { label: "Applications", path: "/admin/applications" },
    { label: "Admissions", path: "/admin/admissions" },
    { label: "Reports", path: "/admin/reports" },
  ],
};

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

      switch (user.role) {
        case "student": endpoint = "/student/profile/me"; break;
        case "institution": endpoint = "/institution/profile/me"; break;
        case "company": endpoint = "/company/profile/me"; break;
        case "admin": endpoint = "/admin/profile/me"; break;
        default: return;
      }

      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const profileData = data.profiles?.[0] || null;
          if (profileData) {
            const pic = user.role === "student" || user.role === "admin"
              ? profileData.profilePic || null
              : profileData.logoUrl || null;
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
      {/* Logo */}
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src="/logo 1.png" alt="Logo" className="logo-img" />
        <span>CAREER-GUIDANCE & EMPLOYMENT</span>
      </div>

      {/* Links */}
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {!user && (
          <>
            <li><button onClick={() => navigate("/")}>Home</button></li>
            <li><button onClick={() => navigate("/jobs")}>Jobs</button></li>
            <li><button onClick={() => navigate("/applications")}>Applications</button></li>
          </>
        )}

        {user && roleLinks[user.role]?.map((link) => (
          <li key={link.path}>
            <button onClick={() => navigate(link.path)}>{link.label}</button>
          </li>
        ))}
      </ul>

      {/* User Profile / Auth */}
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
                <button onClick={() => {
                  switch (user.role) {
                    case "student": navigate("/studentprofile"); break;
                    case "institution": navigate("/institutionprofile"); break;
                    case "company": navigate("/companyprofile"); break;
                    case "admin": navigate("/adminprofile"); break;
                    default: break;
                  }
                }}>Profile</button>
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
