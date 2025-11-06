import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./institutionApplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function InstitutionApplications() {
  const { token } = useContext(UserContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchStudentProfile = async (studentId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/student/profile/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load student profile");
      return data.profile;
    } catch (err) {
      console.error(`Error fetching student ${studentId}:`, err);
      return null;
    }
  };

  const fetchApplications = async () => {
    try {
      const appsRes = await fetch(`${BACKEND_URL}/application/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsData = await appsRes.json();
      if (!appsRes.ok) throw new Error(appsData.message || "Failed to load applications");

      const enrichedApps = await Promise.all(
        (appsData.applications || []).map(async (app) => {
          const studentProfile = await fetchStudentProfile(app.studentId);

          let admission = null;
          try {
            const admRes = await fetch(`${BACKEND_URL}/admission/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const admData = await admRes.json();
            if (admRes.ok) {
              admission = (admData.admissions || []).find(a => a.applicationId === app.id) || null;
            }
          } catch (err) {
            console.error("Failed to fetch admission info:", err);
          }

          let course = {};
          let faculty = {};
          let institution = {};

          if (app.facultyId) {
            try {
              const courseRes = await fetch(`${BACKEND_URL}/course/faculty/${app.facultyId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const courseData = await courseRes.json();
              if (courseRes.ok && courseData.courses?.length > 0) {
                course = courseData.courses.find(c => c.id === app.courseId) || {};
                faculty = course.facultyInfo || {};
                institution = course.institutionInfo || {};
              }
            } catch (err) {
              console.error("Failed to fetch course info:", err);
            }
          }

          return {
            ...app,
            studentProfile,
            courseName: course.courseName || "N/A",
            facultyName: faculty.facultyName || "N/A",
            institutionName: institution.institutionName || "N/A",
            admission,
          };
        })
      );

      setApplications(enrichedApps);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchApplications();
  }, [token]);

  const approveApplication = async (app) => {
    try {
      const res = await fetch(`${BACKEND_URL}/application/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Approved" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve application");

      const admissionRes = await fetch(`${BACKEND_URL}/admission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: app.id,
          admissionStatus: "Accepted",
          remarks: `Welcome to ${app.institutionName}`,
        }),
      });
      const admissionData = await admissionRes.json();
      if (!admissionRes.ok) throw new Error(admissionData.message || "Failed to create admission");

      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, status: "Approved", admission: admissionData.admission }
            : a
        )
      );

      showToast("Application approved and admission created successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const rejectApplication = async (id, remarks = "Rejected") => {
    try {
      const res = await fetch(`${BACKEND_URL}/application/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Rejected", remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject application");

      setApplications((prev) =>
        prev.map(app => (app.id === id ? { ...app, status: "Rejected", remarks } : app))
      );
      showToast("Application rejected successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/application/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete application");

      setApplications(prev => prev.filter(app => app.id !== id));
      showToast("Application deleted successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <div className="applications-container"><div className="loading-state">Loading applications...</div></div>;
  if (!applications.length) return <div className="applications-container"><div className="empty-state"><h2>No Applications Found</h2><p>There are currently no applications submitted to your institution.</p></div></div>;

  return (
    <div className="applications-container">
      {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <h1 className="page-title">Applications to Your Institution</h1>
      </div>

      <div className="applications-list">
        {applications.map((app) => {
          const student = app.studentProfile;
          return (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <div className="application-title">
                  <h2>Application Details</h2>
                  <span className="application-id">ID: {app.id}</span>
                </div>
                <div className={`status-badge ${app.status?.toLowerCase() || ""}`}>
                  {app.status || "N/A"}
                </div>
              </div>

              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Student:</span>
                    <span className="info-value">{student ? `${student.userInfo?.firstName} ${student.userInfo?.lastName}` : "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Course:</span>
                    <span className="info-value highlight">{app.courseName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Faculty:</span>
                    <span className="info-value">{app.facultyName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Institution:</span>
                    <span className="info-value">{app.institutionName}</span>
                  </div>
                  {app.remarks && (
                    <div className="info-item full-width">
                      <span className="info-label">Remarks:</span>
                      <span className="info-value remarks">{app.remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                {student && <button className="view-student-btn" onClick={() => setSelectedStudent(student)}>View Student Profile</button>}

                <div className="action-buttons">
                  {app.status !== "Approved" && <button className="approve-btn" onClick={() => approveApplication(app)}>Approve</button>}
                  {app.status !== "Rejected" && <button className="reject-btn" onClick={() => rejectApplication(app.id)}>Reject</button>}
                  <button className="delete-btn" onClick={() => deleteApplication(app.id)}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="close-modal-btn" onClick={() => setSelectedStudent(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-profile-header">
                <h3>{selectedStudent.userInfo?.firstName} {selectedStudent.userInfo?.lastName}</h3>
                <p className="student-email">{selectedStudent.userInfo?.email}</p>
              </div>

              <div className="student-info-grid">
                <div className="info-item">
                  <span className="info-label">Institution:</span>
                  <span className="info-value">{selectedStudent.institution || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Course:</span>
                  <span className="info-value">{selectedStudent.course || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Year of Study:</span>
                  <span className="info-value">{selectedStudent.yearOfStudy || "N/A"}</span>
                </div>
                {selectedStudent.bio && (
                  <div className="info-item full-width">
                    <span className="info-label">Bio:</span>
                    <span className="info-value bio-text">{selectedStudent.bio}</span>
                  </div>
                )}
                {selectedStudent.skills?.length > 0 && (
                  <div className="info-item full-width">
                    <span className="info-label">Skills:</span>
                    <div className="skills-list">{selectedStudent.skills.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}</div>
                  </div>
                )}
                {selectedStudent.resumeUrl && (
                  <div className="info-item full-width">
                    <span className="info-label">Resume:</span>
                    <a href={selectedStudent.resumeUrl} target="_blank" rel="noreferrer" className="resume-link">View Resume</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
