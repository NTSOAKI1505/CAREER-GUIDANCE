// src/components/AdminProfile.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import "./studentprofile.css"; // keep your existing styles

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminProfile = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(true);
  const fetched = useRef(false);

  // Fetch admin profile
  useEffect(() => {
    if (!token || !user || fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profiles && data.profiles.length > 0) {
          setProfile(data.profiles[0]);
          setEditMode(false);
        } else {
          // initialize new profile
          setProfile({
            userId: user.id,
            userInfo: user,
            department: "",
            roleInAdmin: "",
            bio: "",
            contactEmail: user.email || "",
            contactPhone: "",
            profilePic: "",
          });
          setEditMode(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load admin profile");
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

    if (!profile.department || !profile.roleInAdmin || !profile.contactEmail || !profile.contactPhone) {
      setError("Department, role, email, and phone are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = profile.id
        ? `${BACKEND_URL}/admin/profile/${profile.id}`
        : `${BACKEND_URL}/admin/profile`;
      const method = profile.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: profile.userId,
          department: profile.department,
          roleInAdmin: profile.roleInAdmin,
          bio: profile.bio,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
          profilePic: profile.profilePic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile(data.profile);
      setMessage("✅ Admin profile saved successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLater = () => navigate("/");

  // Loader while profile is fetching
  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading Admin Profile...</p>
      </div>
    );
  }

  if (!profile) return <div className="error">Admin profile not found</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Admin Profile</h1>
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
              <h3>Admin Info</h3>
              <img
                src={profile.profilePic || "https://via.placeholder.com/150"}
                alt="Profile Pic"
                className="profile-image-large"
              />
              <p><strong>Department:</strong> {profile.department || "N/A"}</p>
              <p><strong>Role:</strong> {profile.roleInAdmin || "N/A"}</p>
              <p><strong>Email:</strong> {profile.contactEmail || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.contactPhone || "N/A"}</p>
            </div>

            <div className="profile-card">
              <h3>Uploads</h3>
              <input
                type="text"
                name="profilePic"
                placeholder="Profile Picture URL"
                value={profile.profilePic || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="profile-column">
            <div className="profile-card">
              <h3>Details</h3>
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={profile.department || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
              <input
                type="text"
                name="roleInAdmin"
                placeholder="Role in Admin"
                value={profile.roleInAdmin || ""}
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
                name="contactEmail"
                placeholder="Email"
                value={profile.contactEmail || ""}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="profile-card">
              <h3>Bio</h3>
              <textarea
                name="bio"
                placeholder="Write about yourself..."
                value={profile.bio || ""}
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
            <button type="button" onClick={handleUpdateLater} className="later-btn">
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminProfile;
