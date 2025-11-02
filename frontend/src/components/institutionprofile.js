// src/components/InstitutionProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./studentprofile.css"; // can reuse same CSS

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

  // Fetch profile
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/institution/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profiles && data.profiles.length > 0) {
          setProfile(data.profiles[0]);
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
            contactEmail: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

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
          institutionName: profile.institutionName,
          location: profile.location,
          type: profile.type,
          description: profile.description,
          website: profile.website,
          logoUrl: profile.logoUrl,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
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
          {/* Left Column: Info + Logo */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Institution Info</h3>
              <img
                src={profile.logoUrl || "https://via.placeholder.com/150"}
                alt="Logo"
                className="profile-image-large"
              />
              <p>
                <strong>Name:</strong> {profile.institutionName || "N/A"}
              </p>
              <p>
                <strong>Location:</strong> {profile.location || "N/A"}
              </p>
              <p>
                <strong>Type:</strong> {profile.type || "N/A"}
              </p>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Details</h3>
              <input
                type="text"
                name="institutionName"
                placeholder="Institution Name"
                value={profile.institutionName || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={profile.location || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="type"
                placeholder="Type (University, College, etc.)"
                value={profile.type || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="website"
                placeholder="Website URL"
                value={profile.website || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="contactEmail"
                placeholder="Contact Email"
                value={profile.contactEmail || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="contactPhone"
                placeholder="Contact Phone"
                value={profile.contactPhone || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <textarea
                name="description"
                placeholder="Short description..."
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
