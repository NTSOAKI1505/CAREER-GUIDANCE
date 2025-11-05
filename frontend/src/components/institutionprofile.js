// src/components/InstitutionProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./studentprofile.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InstitutionProfile = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(true);
  const fetched = useRef(false);

  // Fetch institution profile
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/institution/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profiles?.length) {
          const p = data.profiles[0];
          setProfile({
            id: p.id || "",
            userId: p.userId || user.id,
            userInfo: user,
            institutionName: p.institutionName || "",
            location: p.location || "",
            type: p.type || "",
            description: p.description || "",
            website: p.website || "",
            logoUrl: p.logoUrl || "",
            contactEmail: p.contactEmail || user.email || "",
            contactPhone: p.contactPhone || "",
          });
          setEditMode(false);
        } else {
          setProfile({
            userId: user.id,
            userInfo: user,
            institutionName: "",
            location: "",
            type: "",
            description: "",
            website: "",
            logoUrl: "",
            contactEmail: user.email || "",
            contactPhone: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.institutionName || !profile.contactEmail || !profile.contactPhone) {
      setError("Institution name, email, and phone are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = profile.id
        ? `${BACKEND_URL}/institution/profile/${profile.id}`
        : `${BACKEND_URL}/institution/profile`;
      const method = profile.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile((prev) => ({ ...prev, id: data.profile.id || prev.id }));
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
        <p>Loading Institution Profile...</p>
      </div>
    );
  }

  if (!profile) return <div className="error">Profile not found</div>;

  const inputFields = [
    { name: "institutionName", placeholder: "Institution Name" },
    { name: "contactEmail", placeholder: "Email", type: "email" },
    { name: "contactPhone", placeholder: "Phone" },
    { name: "location", placeholder: "Location" },
    { name: "type", placeholder: "Type (University, College, etc.)" },
    { name: "website", placeholder: "Website URL" },
  ];

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Institution Profile</h1>
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
              <h3>Institution Info</h3>
              <img
                loading="lazy"
                src={profile.logoUrl || "https://via.placeholder.com/150"}
                alt="Logo"
                className="profile-image-large"
              />
              {inputFields.slice(0, 3).map((f) => (
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
              <h3>Uploads</h3>
              <input
                type="text"
                name="logoUrl"
                placeholder="Logo URL"
                value={profile.logoUrl || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              {profile.logoUrl && (
                <img src={profile.logoUrl} alt="Logo Preview" className="profile-image" loading="lazy"/>
              )}
            </div>
          </div>

          <div className="profile-column">
            <div className="profile-card">
              <h3>Details</h3>
              {inputFields.slice(3).map((f) => (
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
              <textarea
                name="description"
                placeholder="Description"
                value={profile.description || ""}
                onChange={handleChange}
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

export default InstitutionProfile;
