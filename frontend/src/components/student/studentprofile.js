// src/components/StudentProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./studentprofile.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StudentProfile = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(true);

  const fetched = useRef(false);

  // Fetch student profile
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/student/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profiles?.length) {
          setProfile(data.profiles[0]);
          setEditMode(false);
        } else {
          setProfile({
            userId: user.id,
            userInfo: user,
            institution: "",
            course: "",
            yearOfStudy: "",
            bio: "",
            skills: [],
            resumeUrl: "",
            profilePic: "",
          });
          setEditMode(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const handleChange = ({ target: { name, value } }) =>
    setProfile((prev) => ({ ...prev, [name]: value }));

  const handleSkillsChange = ({ target: { value } }) =>
    setProfile((prev) => ({
      ...prev,
      skills: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.institution || !profile.course || !profile.yearOfStudy) {
      setError("Institution, course, and year of study are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = profile.id
        ? `${BACKEND_URL}/student/profile/${profile.id}`
        : `${BACKEND_URL}/student/profile`;
      const method = profile.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profile,
          yearOfStudy: Number(profile.yearOfStudy),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile(data.profile);
      setMessage("✅ Profile saved successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading Student Profile...</p>
      </div>
    );
  }

  if (!profile) return <div className="error">Profile not found</div>;

  const leftFields = [
    { name: "resumeUrl", placeholder: "Resume URL" },
    { name: "profilePic", placeholder: "Profile Picture URL" },
  ];

  const rightFields = [
    { name: "institution", placeholder: "Institution" },
    { name: "course", placeholder: "Course" },
    { name: "yearOfStudy", placeholder: "Year of Study", type: "number" },
  ];

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Student Profile</h1>
        {!editMode && (
          <div className="profile-actions-view">
            <button className="edit-btn" onClick={() => setEditMode(true)}>Edit</button>
            <button className="later-btn" onClick={() => navigate("/")}>Cancel</button>
          </div>
        )}
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className={`profile-form ${editMode ? "edit-mode" : "view-mode"}`}>
        <div className="profile-columns">
          <div className="profile-column">
            <div className="profile-card">
              <h3>Personal Info</h3>
              <img
                loading="lazy"
                src={profile.profilePic || "https://via.placeholder.com/150"}
                alt="Profile"
                className="profile-image-large"
              />
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="profile-card">
              <h3>Uploads</h3>
              {leftFields.map((f) => (
                <input
                  key={f.name}
                  type={f.type || "text"}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={profile[f.name] || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              ))}
            </div>
          </div>

          <div className="profile-column">
            <div className="profile-card">
              <h3>Education</h3>
              {rightFields.map((f) => (
                <input
                  key={f.name}
                  type={f.type || "text"}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={profile[f.name] || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              ))}
            </div>

            <div className="profile-card">
              <h3>About You</h3>
              <textarea
                name="bio"
                placeholder="Short bio..."
                value={profile.bio || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="skills"
                placeholder="Skills (comma separated)"
                value={profile.skills?.join(", ") || ""}
                onChange={handleSkillsChange}
                disabled={!editMode}
              />
            </div>
          </div>
        </div>

        {editMode && (
          <div className="profile-actions">
            <button type="submit" disabled={saving} className="save-btn">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/")} className="later-btn">
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentProfile;
