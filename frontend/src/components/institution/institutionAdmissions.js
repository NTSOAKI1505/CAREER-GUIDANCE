import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./institutionAdmissions.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function InstitutionAdmissions() {
  const { token } = useContext(UserContext);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchStudent = async (studentId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/student/profile/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch student");
      const data = await res.json();
      return data.profile || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchCourse = async (courseId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch course");
      const data = await res.json();
      return data.course || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchInstitution = async (institutionId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/institution/profile/${institutionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch institution");
      const data = await res.json();
      return data.profile || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admission/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch admissions");

      const enriched = await Promise.all(
        (data.admissions || []).map(async (adm) => {
          const student = adm.studentId ? await fetchStudent(adm.studentId) : null;
          const course = adm.courseId ? await fetchCourse(adm.courseId) : null;
          const institution = adm.institutionId ? await fetchInstitution(adm.institutionId) : null;

          return {
            ...adm,
            studentProfile: student,
            courseName: course?.courseName || "N/A",
            facultyName: course?.facultyInfo?.facultyName || "N/A",
            institutionName: institution?.institutionName || "N/A",
          };
        })
      );

      setAdmissions(enriched);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdmissions();
  }, [token]);

  const updateAdmissionStatus = async (admissionId, status, remarks = "") => {
    try {
      const res = await fetch(`${BACKEND_URL}/admission/${admissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ admissionStatus: status, remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update admission");
      showToast(`Admission ${status.toLowerCase()} successfully`, "success");
      fetchAdmissions();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteAdmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admission?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admission/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete admission");
      showToast("Admission deleted successfully", "success");
      fetchAdmissions();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading)
    return (
      <div className="admissions-container">
        <div className="loading-spinner">Loading admissions...</div>
      </div>
    );

  if (!admissions.length)
    return (
      <div className="admissions-container">
        <div className="empty-state">
          <h2>No Admissions Found</h2>
        </div>
      </div>
    );

  return (
    <div className="admissions-container">
      {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <h1 className="page-title">Institution Admissions</h1>
        <span className="applications-count">{admissions.length} Admission(s)</span>
      </div>

      <div className="applications-grid">
        {admissions.map((adm) => {
          const student = adm.studentProfile;
          return (
            <div key={adm.id} className="application-card">
              <div className="card-header">
                <h2>Admission ID: {adm.id}</h2>
                <div className={`status-badge ${adm.admissionStatus?.toLowerCase() || ""}`}>
                  {adm.admissionStatus || "N/A"}
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
                    <span className="info-value">{adm.courseName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Faculty:</span>
                    <span className="info-value">{adm.facultyName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Institution:</span>
                    <span className="info-value">{adm.institutionName}</span>
                  </div>
                  {adm.remarks && (
                    <div className="info-item full-width">
                      <span className="info-label">Remarks:</span>
                      <span className="info-value remarks">{adm.remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                {student && (
                  <button className="view-student-btn" onClick={() => setSelectedStudent(student)}>
                    View Student Profile
                  </button>
                )}
                <div className="action-buttons">
                  {adm.admissionStatus !== "Accepted" && (
                    <button
                      className="approve-btn"
                      onClick={() =>
                        updateAdmissionStatus(adm.id, "Accepted", `Welcome to ${adm.institutionName}`)
                      }
                    >
                      Accept
                    </button>
                  )}
                  {adm.admissionStatus !== "Rejected" && (
                    <button
                      className="reject-btn"
                      onClick={() => updateAdmissionStatus(adm.id, "Rejected", "Admission rejected")}
                    >
                      Reject
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => deleteAdmission(adm.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="close-modal-btn" onClick={() => setSelectedStudent(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3>{selectedStudent.userInfo?.firstName} {selectedStudent.userInfo?.lastName}</h3>
              <p>Email: {selectedStudent.userInfo?.email}</p>
              <p>Institution: {selectedStudent.institution}</p>
              <p>Course: {selectedStudent.course}</p>
              <p>Year of Study: {selectedStudent.yearOfStudy}</p>
              {selectedStudent.bio && <p>Bio: {selectedStudent.bio}</p>}
              {selectedStudent.skills?.length > 0 && <p>Skills: {selectedStudent.skills.join(", ")}</p>}
              {selectedStudent.resumeUrl && (
                <p>
                  Resume: <a href={selectedStudent.resumeUrl} target="_blank" rel="noreferrer">View</a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
