import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./ManageInstitutions.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ManageInstitutions = () => {
  const { token } = useContext(UserContext);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [expandedInstitutions, setExpandedInstitutions] = useState([]);
  const [expandedFaculties, setExpandedFaculties] = useState([]);
  const [saving, setSaving] = useState(false);

  // Faculty Modal
  const [facultyModal, setFacultyModal] = useState({ open: false, instId: null, faculty: null });
  const [facultyForm, setFacultyForm] = useState({
    facultyName: "", description: "", deanName: "", contactEmail: "", contactPhone: "", establishedYear: "", website: "", id: null
  });

  // Course Modal
  const [courseModal, setCourseModal] = useState({ open: false, facultyId: null, institutionId: null, course: null });
  const [courseForm, setCourseForm] = useState({
    courseName: "", description: "", courseCode: "", credits: "", duration: ""
  });

  const showMessage = (msg, type = "success") => {
    if (type === "success") setMessage(msg);
    else setErrorMsg(msg);
    setTimeout(() => { setMessage(""); setErrorMsg(""); }, 3000);
  };

  // Fetch institutions with faculties and courses
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/institution/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch institutions");

      const instList = await Promise.all(
        data.profiles.map(async (inst) => {
          const facRes = await fetch(`${BACKEND_URL}/faculty/institution/${inst.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const facData = await facRes.json();
          const faculties = facData.faculties || [];

          const facultiesWithCourses = await Promise.all(
            faculties.map(async (f) => {
              const courseRes = await fetch(`${BACKEND_URL}/course/faculty/${f.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const courseData = await courseRes.json();
              return { ...f, courses: courseData.courses || [] };
            })
          );

          return { ...inst, faculties: facultiesWithCourses };
        })
      );

      setInstitutions(instList);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchInstitutions(); }, [token]);

  // Toggle rows
  const toggleInstitution = (instId) =>
    setExpandedInstitutions(prev =>
      prev.includes(instId) ? prev.filter(i => i !== instId) : [...prev, instId]
    );

  const toggleFaculty = (facId) =>
    setExpandedFaculties(prev =>
      prev.includes(facId) ? prev.filter(f => f !== facId) : [...prev, facId]
    );

  // Faculty Modal Handlers
  const openFacultyModal = (instId, faculty = null) => {
    if (faculty) setFacultyForm({ ...faculty });
    else setFacultyForm({
      facultyName: "", description: "", deanName: "", contactEmail: "", contactPhone: "", establishedYear: "", website: "", id: null
    });
    setFacultyModal({ open: true, instId, faculty });
  };

  const handleFacultyChange = (e) => setFacultyForm({ ...facultyForm, [e.target.name]: e.target.value });

  const submitFaculty = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = facultyForm.id ? "PUT" : "POST";
      const url = facultyForm.id
        ? `${BACKEND_URL}/faculty/${facultyForm.id}`
        : `${BACKEND_URL}/faculty`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...facultyForm, institutionId: facultyModal.instId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save faculty");

      setInstitutions(prev =>
        prev.map(inst => {
          if (inst.id !== facultyModal.instId) return inst;
          const faculties = inst.faculties || [];
          if (facultyForm.id) return { ...inst, faculties: faculties.map(f => (f.id === data.faculty.id ? data.faculty : f)) };
          else return { ...inst, faculties: [...faculties, { ...data.faculty, courses: [] }] };
        })
      );

      showMessage(facultyForm.id ? "✅ Faculty updated" : "✅ Faculty added");
      setFacultyModal({ open: false, instId: null, faculty: null });
    } catch (err) { showMessage(err.message, "error"); }
    finally { setSaving(false); }
  };

  const deleteFaculty = async (instId, facultyId) => {
    if (!window.confirm("Delete this faculty?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/faculty/${facultyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete faculty");

      setInstitutions(prev =>
        prev.map(inst => inst.id !== instId ? inst : { ...inst, faculties: (inst.faculties || []).filter(f => f.id !== facultyId) })
      );
      showMessage("✅ Faculty deleted");
    } catch (err) { showMessage(err.message, "error"); }
  };

  // Course Modal Handlers
  const openCourseModal = (facultyId, instId, course = null) => {
    if (course) setCourseForm({ ...course });
    else setCourseForm({ courseName: "", description: "", courseCode: "", credits: "", duration: "" });

    setCourseModal({ open: true, facultyId, institutionId: instId, course });
  };

  const handleCourseChange = (e) => setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const submitCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!courseModal.facultyId || !courseModal.institutionId || !courseForm.courseName) throw new Error("Faculty, Institution, and Course Name are required");

      const method = courseModal.course ? "PUT" : "POST";
      const url = courseModal.course ? `${BACKEND_URL}/course/${courseModal.course.id}` : `${BACKEND_URL}/course`;
      const body = { ...courseForm, facultyId: courseModal.facultyId, institutionId: courseModal.institutionId };

      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save course");

      setInstitutions(prev =>
        prev.map(inst => ({
          ...inst,
          faculties: inst.faculties.map(f =>
            f.id !== courseModal.facultyId
              ? f
              : {
                  ...f,
                  courses: courseModal.course
                    ? f.courses.map(c => (c.id === data.course.id ? data.course : c))
                    : [...(f.courses || []), data.course]
                }
          )
        }))
      );

      showMessage(courseModal.course ? "✅ Course updated" : "✅ Course added");
      setCourseModal({ open: false, facultyId: null, institutionId: null, course: null });
    } catch (err) { showMessage(err.message, "error"); }
    finally { setSaving(false); }
  };

  const deleteCourse = async (facultyId, courseId) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/course/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete course");

      setInstitutions(prev =>
        prev.map(inst => ({
          ...inst,
          faculties: inst.faculties.map(f =>
            f.id !== facultyId ? f : { ...f, courses: f.courses.filter(c => c.id !== courseId) }
          )
        }))
      );
      showMessage("✅ Course deleted");
    } catch (err) { showMessage(err.message, "error"); }
  };

  if (loading) return <p>Loading institutions...</p>;

  return (
    <div className="manage-institutions-wrapper">
      {message && <p className="ok success">{message}</p>}
      {errorMsg && <p className="ok error">{errorMsg}</p>}

      <table className="main-table">
        <tbody>
          {institutions.map(inst => (
            <>
              <tr key={inst.id} className="inst-row">
                <td>{inst.institutionName}</td>
                <td>{inst.contactEmail}</td>
                <td>{inst.location}</td>
                <td>{inst.type}</td>
                <td>
                  <button onClick={() => toggleInstitution(inst.id)}>{expandedInstitutions.includes(inst.id) ? "▼" : "▶"}</button>
                  <button onClick={() => openFacultyModal(inst.id)}>＋ Faculty</button>
                </td>
              </tr>

              {expandedInstitutions.includes(inst.id) && inst.faculties.map(f => (
                <>
                  <tr key={f.id} className="faculty-row">
                    <td className="indent">{f.facultyName}</td>
                    <td>{f.contactEmail} / {f.deanName}</td>
                    <td>{inst.location} / {f.website}</td>
                    <td>-</td>
                    <td>
                      <button onClick={() => toggleFaculty(f.id)}>{expandedFaculties.includes(f.id) ? "▼" : "▶"}</button>
                      <button onClick={() => openFacultyModal(inst.id, f)}>Edit</button>
                      <button onClick={() => deleteFaculty(inst.id, f.id)}>Delete</button>
                      <button onClick={() => openCourseModal(f.id, inst.id)}>＋ Course</button>
                    </td>
                  </tr>

                  {expandedFaculties.includes(f.id) && f.courses.map(c => (
                    <tr key={c.id} className="course-row">
                      <td className="indent2">{c.courseName}</td>
                      <td>{c.courseCode}</td>
                      <td>{c.credits}</td>
                      <td>{c.duration}</td>
                      <td>
                        <button onClick={() => openCourseModal(f.id, inst.id, c)}>Edit</button>
                        <button onClick={() => deleteCourse(f.id, c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </>
          ))}
        </tbody>
      </table>

      {/* Faculty Modal */}
      {facultyModal.open && (
        <div className="modal-overlay" onClick={() => !saving && setFacultyModal({ open: false, faculty: null, instId: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{facultyForm.id ? "Edit Faculty" : "Add Faculty"}</h3>
            <form onSubmit={submitFaculty}>
              {["facultyName", "description", "deanName", "contactEmail", "contactPhone", "establishedYear", "website"].map(f => (
                <input
                  key={f}
                  type={f === "establishedYear" ? "number" : "text"}
                  name={f}
                  placeholder={f.replace(/([A-Z])/g, " $1")}
                  value={facultyForm[f] || ""}
                  onChange={handleFacultyChange}
                  required={["facultyName", "description"].includes(f)}
                  readOnly={["deanName", "contactEmail", "contactPhone", "website"].includes(f)}
                />
              ))}
              <div className="modal-buttons">
                <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setFacultyModal({ open: false, faculty: null, instId: null })} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {courseModal.open && (
        <div className="modal-overlay" onClick={() => !saving && setCourseModal({ open: false, facultyId: null, institutionId: null, course: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{courseModal.course ? "Edit Course" : "Add Course"}</h3>
            <form onSubmit={submitCourse}>
              {["courseName", "description", "courseCode", "credits", "duration"].map(f => (
                <input
                  key={f}
                  type={f === "credits" ? "number" : "text"}
                  name={f}
                  placeholder={f.replace(/([A-Z])/g, " $1")}
                  value={courseForm[f]}
                  onChange={handleCourseChange}
                  required
                />
              ))}
              <div className="modal-buttons">
                <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setCourseModal({ open: false, facultyId: null, institutionId: null, course: null })} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInstitutions;
