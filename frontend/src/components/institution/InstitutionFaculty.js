import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./institutionFaculty.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function InstitutionFaculty() {
  const { user, token } = useContext(UserContext);
  const [faculties, setFaculties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const [courseModal, setCourseModal] = useState({ open: false, facultyId: null, course: null });
  const [facultyCourses, setFacultyCourses] = useState({});
  const fetchedProfile = useRef(false);

  const [formData, setFormData] = useState({
    facultyName: "",
    description: "",
    deanName: "",
    contactEmail: "",
    contactPhone: "",
    establishedYear: "",
    website: "",
  });

  const [courseForm, setCourseForm] = useState({
    courseName: "",
    description: "",
    courseCode: "",
    credits: "",
    duration: "",
  });

  const showMessage = (msg, type = "success") => {
    if (type === "success") setMessage(msg);
    else setError(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  };

  // Fetch institution profile
  useEffect(() => {
    if (!token || !user || fetchedProfile.current) return;
    fetchedProfile.current = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/institution/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        if (data.profiles?.length) {
          const p = data.profiles[0];
          setProfile(p);
          setFormData({
            facultyName: "",
            description: "",
            deanName: user.firstName + " " + user.lastName,
            contactEmail: p.contactEmail || user.email,
            contactPhone: p.contactPhone || "",
            establishedYear: "",
            website: p.website || "",
          });
        }
      } catch (err) {
        showMessage(err.message, "error");
      }
    };
    fetchProfile();
  }, [user, token]);

  // Fetch faculties
  useEffect(() => {
    if (!user || !token || !profile) return;
    const fetchFaculties = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/faculty/institution/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch faculties");
        setTimeout(() => {
          setFaculties(data.faculties || []);
          setLoading(false);
        }, 500);
      } catch (err) {
        showMessage(err.message, "error");
        setLoading(false);
      }
    };
    fetchFaculties();
  }, [user, token, profile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCourseChange = (e) => setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile || !user) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `${BACKEND_URL}/faculty/${formData.id}` : `${BACKEND_URL}/faculty`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, institutionId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save faculty");

      if (formData.id) {
        setFaculties((prev) => prev.map((f) => (f.id === data.faculty.id ? data.faculty : f)));
        showMessage("✅ Faculty updated successfully!");
      } else {
        setFaculties((prev) => [...prev, data.faculty]);
        showMessage("✅ Faculty added successfully!");
      }

      setModalOpen(false);
      setFormData({
        facultyName: "",
        description: "",
        deanName: user.firstName + " " + user.lastName,
        contactEmail: profile.contactEmail || user.email,
        contactPhone: profile.contactPhone || "",
        establishedYear: "",
        website: profile.website || "",
      });
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const fetchCourses = async (facultyId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/course/faculty/${facultyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch courses");
      setFacultyCourses((prev) => ({
        ...prev,
        [facultyId]: data.courses || [],
      }));
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const toggleFaculty = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter((eid) => eid !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
      if (!facultyCourses[id]) fetchCourses(id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/faculty/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete faculty");
      setFaculties(faculties.filter((f) => f.id !== id));
      showMessage("✅ Faculty deleted successfully!");
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleEdit = (faculty) => {
    setFormData({ ...faculty });
    setModalOpen(true);
  };

  // ✅ Add or Edit Course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    const facultyId = courseModal.facultyId;
    if (!facultyId || !profile) return;
    setSaving(true);
    try {
      const method = courseModal.course ? "PUT" : "POST";
      const url = courseModal.course
        ? `${BACKEND_URL}/course/${courseModal.course.id}`
        : `${BACKEND_URL}/course`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...courseForm,
          facultyId,
          institutionId: profile.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save course");

      setFacultyCourses((prev) => ({
        ...prev,
        [facultyId]: courseModal.course
          ? prev[facultyId].map((c) => (c.id === data.course.id ? data.course : c))
          : [...(prev[facultyId] || []), data.course],
      }));

      showMessage(courseModal.course ? "✅ Course updated successfully!" : "✅ Course added successfully!");
      setCourseModal({ open: false, facultyId: null, course: null });
      setCourseForm({
        courseName: "",
        description: "",
        courseCode: "",
        credits: "",
        duration: "",
      });
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete Course
  const handleDeleteCourse = async (facultyId, courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/course/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete course");
      setFacultyCourses((prev) => ({
        ...prev,
        [facultyId]: prev[facultyId].filter((c) => c.id !== courseId),
      }));
      showMessage("✅ Course deleted successfully!");
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="institution-faculty">
      <div className="header">
        <h2>Faculties & Courses</h2>
        <button className="add-btn" onClick={() => setModalOpen(true)}>＋</button>
      </div>

      {message && <p className="ok success">{message}</p>}
      {error && <p className="ok error">{error}</p>}

      <ul className="faculty-list">
        {faculties.map((f) => (
          <li key={f.id} className="faculty-card">
            <div className="faculty-top">
              <div className="faculty-main">
                <button
                  className={`collapse-icon ${expandedIds.includes(f.id) ? "open" : ""}`}
                  onClick={() => toggleFaculty(f.id)}
                  title={expandedIds.includes(f.id) ? "Collapse" : "Expand"}
                >
                  {expandedIds.includes(f.id) ? "▼" : "▶"}
                </button>
                <div className="faculty-details">
                  <h3>{f.facultyName}</h3>
                  <p>{f.description}</p>
                  <p>{f.contactEmail}</p>
                  <p>{f.website}</p>
                </div>
              </div>

              <div className="faculty-actions">
                <button onClick={() => handleEdit(f)} title="Edit">✏️</button>
                <button onClick={() => handleDelete(f.id)} title="Delete">🗑️</button>
              </div>
            </div>

            {expandedIds.includes(f.id) && (
              <div className="course-details">
                <button
                  className="add-course-btn"
                  onClick={() => setCourseModal({ open: true, facultyId: f.id, course: null })}
                >
                  ➕ 
                </button>
                <ul className="course-list">
                  {(facultyCourses[f.id] || []).map((c) => (
                    <li key={c.id} className="course-item">
                      <div className="course-header">
                        <strong>{c.courseName}</strong> – {c.courseCode}
                          <p>{c.description}</p>
                          <p>Credits: {c.credits} | Duration: {c.duration}</p>
                        <div className="course-actions">
                          <button
                            onClick={() => {
                              setCourseForm({ ...c });
                              setCourseModal({ open: true, facultyId: f.id, course: c });
                            }}
                            title="Edit Course"
                          >
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteCourse(f.id, c.id)} title="Delete Course">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Faculty Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{formData.id ? "Edit Faculty" : "Add Faculty"}</h3>
            <form onSubmit={handleSubmit}>
              {["facultyName", "description", "deanName", "contactEmail", "contactPhone", "establishedYear", "website"].map(
                (field) => (
                  <input
                    key={field}
                    type={field === "establishedYear" ? "number" : "text"}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, " $1")}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    required={["facultyName", "description"].includes(field)}
                    readOnly={["deanName", "contactEmail", "contactPhone", "website"].includes(field)}
                  />
                )
              )}
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {courseModal.open && (
        <div className="modal-overlay" onClick={() => !saving && setCourseModal({ open: false, facultyId: null, course: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{courseModal.course ? "Edit Course" : "Add Course"}</h3>
            <form onSubmit={handleAddCourse}>
              {["courseName", "description", "courseCode", "credits", "duration"].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={field === "credits" ? "number" : "text"}
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={courseForm[field]}
                  onChange={handleCourseChange}
                  required
                />
              ))}
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setCourseModal({ open: false, facultyId: null, course: null })}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstitutionFaculty;
