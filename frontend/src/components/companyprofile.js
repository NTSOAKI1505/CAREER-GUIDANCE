// src/components/CompanyProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./studentprofile.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CompanyProfile = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(true);
  const fetched = useRef(false);

  // Fetch company profile
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/company/profile/me`, {
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
            companyName: user.firstName || "",
            location: "",
            industry: "",
            description: "",
            website: "",
            logoUrl: "",
            contactEmail: user.email || "",
            contactPhone: "",
          });
          setEditMode(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load company profile");
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

    if (!profile.companyName || !profile.contactEmail || !profile.contactPhone) {
      setError("Company name, email, and phone are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = profile.id
        ? `${BACKEND_URL}/company/profile/${profile.id}`
        : `${BACKEND_URL}/company/profile`;
      const method = profile.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: profile.userId,
          companyName: profile.companyName,
          location: profile.location,
          industry: profile.industry,
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
      setMessage("✅ Company profile saved successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLater = () => navigate("/");

  // Loader while fetching
  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading Company Profile...</p>
      </div>
    );
  }

  if (!profile) return <div className="error">Company profile not found</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Company Profile</h1>
        {!editMode && (
          <div className="profile-actions-view">
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit
            </button>
            <button className="later-btn" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className={`profile-form ${editMode ? "edit-mode" : "view-mode"}`}
      >
        <div className="profile-columns">
          {/* LEFT COLUMN */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Company Info</h3>
              <img
                src={profile.logoUrl || "https://via.placeholder.com/150"}
                alt="Company Logo"
                className="profile-image-large"
              />
              <p><strong>Company:</strong> {profile.companyName || "Not specified"}</p>
              <p><strong>Email:</strong> {profile.contactEmail || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.contactPhone || "N/A"}</p>
            </div>

            <div className="profile-card">
              <h3>Uploads</h3>
              <input
                type="text"
                name="logoUrl"
                placeholder="Company Logo URL"
                value={profile.logoUrl || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="website"
                placeholder="Company Website"
                value={profile.website || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Company Details</h3>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={profile.companyName || ""}
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
                name="industry"
                placeholder="Industry"
                value={profile.industry || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="profile-card">
              <h3>About the Company</h3>
              <textarea
                name="description"
                placeholder="Describe your company..."
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
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanyProfile;
