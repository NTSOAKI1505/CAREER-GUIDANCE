import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./studentprofile.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StudentProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetched = useRef(false);

  // ✅ Fetch profile only once
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.profiles?.length > 0) {
          setProfile(data.profiles[0]);
        } else {
          setProfile({
            userId: storedUser.id,
            userInfo: storedUser,
            institution: "",
            course: "",
            yearOfStudy: "",
            bio: "",
            skills: [],
            resumeUrl: "",
            profilePic: "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, storedUser]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setProfile((prev) => ({
      ...prev,
      skills: value.split(",").map((s) => s.trim()),
    }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setMessage("");
    setError("");
    setSaving(true);

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
          userId: profile.userInfo?.id || profile.userId,
          institution: profile.institution,
          course: profile.course,
          yearOfStudy: Number(profile.yearOfStudy),
          bio: profile.bio,
          skills: profile.skills,
          resumeUrl: profile.resumeUrl,
          profilePic: profile.profilePic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile(data.profile);
      setMessage("✅ Profile saved successfully!");

      // ✅ Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  const userInfo = profile.userInfo || storedUser;

  return (
    <div className="profile-container">
      <h1>Student Profile</h1>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Info */}
        <div className="profile-section">
          <h3>Personal Info</h3>
          <p>
            <strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
        </div>

        {/* Education */}
        <div className="profile-section">
          <h3>Education</h3>
          <input
            type="text"
            name="institution"
            placeholder="Institution"
            value={profile.institution || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="course"
            placeholder="Course"
            value={profile.course || ""}
            onChange={handleChange}
          />
          <input
            type="number"
            name="yearOfStudy"
            placeholder="Year of Study"
            value={profile.yearOfStudy || ""}
            onChange={handleChange}
          />
        </div>

        {/* About */}
        <div className="profile-section">
          <h3>About You</h3>
          <textarea
            name="bio"
            placeholder="Write a short bio..."
            value={profile.bio || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={profile.skills?.join(", ") || ""}
            onChange={handleSkillsChange}
          />
        </div>

        {/* Uploads */}
        <div className="profile-section">
          <h3>Uploads</h3>
          <input
            type="text"
            name="resumeUrl"
            placeholder="Resume URL"
            value={profile.resumeUrl || ""}
            onChange={handleChange}
          />
          <input
            type="text"
            name="profilePic"
            placeholder="Profile Picture URL"
            value={profile.profilePic || ""}
            onChange={handleChange}
          />
          {profile.profilePic && (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="profile-image"
            />
          )}
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
