import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./studentadmissions.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function StudentAdmissions() {
  const { token } = useContext(UserContext);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
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
          const course = adm.courseId ? await fetchCourse(adm.courseId) : null;
          const institution = adm.institutionId ? await fetchInstitution(adm.institutionId) : null;

          return {
            ...adm,
            courseName: course?.courseName || "N/A",
            facultyName: course?.facultyInfo?.facultyName || "N/A",
            institutionProfile: institution || null,
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
          const institution = adm.institutionProfile;
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
                    <span className="info-label">Course:</span>
                    <span className="info-value">{adm.courseName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Faculty:</span>
                    <span className="info-value">{adm.facultyName}</span>
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
                {institution && (
                  <button
                    className="view-institution-btn"
                    onClick={() => setSelectedInstitution(institution)}
                  >
                    View Institution
                  </button>
                )}
                <div className="action-buttons">
                  {adm.admissionStatus !== "Accepted" && (
                    <button
                      className="approve-btn"
                      onClick={() =>
                        updateAdmissionStatus(adm.id, "Accepted", `Welcome to ${institution?.institutionName}`)
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedInstitution && (
        <div className="modal-overlay" onClick={() => setSelectedInstitution(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Institution Profile</h2>
              <button className="close-modal-btn" onClick={() => setSelectedInstitution(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3>{selectedInstitution.institutionName}</h3>
              <p>Email: {selectedInstitution.contactEmail}</p>
              <p>Phone: {selectedInstitution.contactPhone}</p>
              <p>Location: {selectedInstitution.location}</p>
              <p>Type: {selectedInstitution.type}</p>
              {selectedInstitution.description && <p>Description: {selectedInstitution.description}</p>}
              {selectedInstitution.website && (
                <p>
                  Website: <a href={selectedInstitution.website} target="_blank" rel="noreferrer">{selectedInstitution.website}</a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
