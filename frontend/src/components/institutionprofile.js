// src/components/InstitutionProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./studentprofile.css"; // reuse the same CSS

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

  // Fetch profile on mount
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/institution/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profile) {
          const p = data.profile;
          setProfile({
            id: p.id,
            userId: p.userId,
            userInfo: p.userInfo,
            institutionName: p.institutionName || "",
            location: p.location || "",
            type: p.type || "",
            description: p.description || "",
            website: p.website || "",
            logoUrl: p.logoUrl || "",
            contactEmail: p.contactEmail || p.userInfo?.email || "",
            contactPhone: p.contactPhone || "",
          });
          setEditMode(false); // profile exists
        } else {
          // No profile exists yet
          setProfile({
            userId: user.id, // ensure userId is present
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
    };

    fetchProfile();
  }, [token, user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    // Validate required fields
    if (
      !profile.institutionName.trim() ||
      !profile.contactEmail.trim() ||
      !profile.contactPhone.trim()
    ) {
      setError("Required fields are missing");
      return;
    }

    setMessage("");
    setError("");
    setSaving(true);

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
        body: JSON.stringify({
          userId: profile.userId, // always send userId
          institutionName: profile.institutionName.trim(),
          location: profile.location.trim(),
          type: profile.type.trim(),
          description: profile.description.trim(),
          website: profile.website.trim(),
          logoUrl: profile.logoUrl.trim(),
          contactEmail: profile.contactEmail.trim(),
          contactPhone: profile.contactPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile((prev) => ({ ...prev, ...data.profile }));
      setMessage("✅ Profile saved successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLater = () => navigate("/");

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Institution Profile</h1>
        {!editMode && (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className={`profile-form ${editMode ? "edit-mode" : "view-mode"}`}
      >
        <div className="profile-columns">
          {/* Left Column: Logo + Contact */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Institution Info</h3>
              <img
                src={profile.logoUrl || "https://via.placeholder.com/150"}
                alt="Logo"
                className="profile-image-large"
              />
              <input
                type="text"
                name="institutionName"
                placeholder="Name"
                value={profile.institutionName}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
              <input
                type="email"
                name="contactEmail"
                placeholder="Email"
                value={profile.contactEmail}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
              <input
                type="text"
                name="contactPhone"
                placeholder="Phone"
                value={profile.contactPhone}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
            </div>

            <div className="profile-card">
              <h3>Uploads</h3>
              <input
                type="text"
                name="logoUrl"
                placeholder="Logo URL"
                value={profile.logoUrl}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Details</h3>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={profile.location}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="type"
                placeholder="Type (University, College, etc.)"
                value={profile.type}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="website"
                placeholder="Website URL"
                value={profile.website}
                onChange={handleChange}
                disabled={!editMode}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={profile.description}
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
            <button
              type="button"
              onClick={handleUpdateLater}
              className="later-btn"
            >
              Update Later
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InstitutionProfile;
