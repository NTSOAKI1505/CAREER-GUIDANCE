import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./companyApplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CompanyApplications = () => {
  const { token } = useContext(UserContext);
  const [applicationsByJob, setApplicationsByJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // 1️⃣ Fetch all company applications
        const res = await fetch(`${BACKEND_URL}/jobApplications/company/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status !== "success" || !data.applications.length) {
          setApplicationsByJob([]);
          return;
        }

        const applications = data.applications;

        // 2️⃣ Fetch job info for each unique jobId
        const jobIds = [...new Set(applications.map(a => a.jobId))];
        const jobsData = await Promise.all(
          jobIds.map(async id => {
            const res = await fetch(`${BACKEND_URL}/jobs/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const job = await res.json();
            return { jobId: id, jobInfo: job.job || { title: "Unknown Job" } };
          })
        );

        // 3️⃣ Map jobId -> jobInfo
        const jobMap = jobsData.reduce((acc, j) => {
          acc[j.jobId] = j.jobInfo;
          return acc;
        }, {});

        // 4️⃣ Group applications by jobId
        const grouped = jobIds.map(jobId => ({
          jobId,
          jobInfo: jobMap[jobId],
          applications: applications.filter(a => a.jobId === jobId),
        }));

        setApplicationsByJob(grouped);
      } catch (err) {
        console.error("Error fetching applications or jobs:", err);
        setApplicationsByJob([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`${BACKEND_URL}/jobApplications/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setApplicationsByJob(prev =>
          prev.map(group => ({
            ...group,
            applications: group.applications.map(a =>
              a.id === appId ? data.application : a
            ),
          }))
        );
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading applications...</p>;
  if (!applicationsByJob.length) return <p>No applications yet.</p>;

  return (
    <div className="company-applications-container">
      {applicationsByJob.map(group => (
        <div key={group.jobId} className="job-application-group">
          <h2 className="job-title">{group.jobInfo.title}</h2>
          <p><strong>Location:</strong> {group.jobInfo.location || "N/A"}</p>
          <p><strong>Type:</strong> {group.jobInfo.jobType || "N/A"}</p>
          <p><strong>Salary:</strong> {group.jobInfo.salaryRange || "N/A"}</p>

          <div className="applications-list">
            {group.applications.map(app => (
              <div key={app.id} className="application-card">
                <h3 className="student-name">{app.studentName}</h3>
                <p><strong>Email:</strong> {app.studentEmail}</p>
                <p><strong>Status:</strong> {app.status}</p>
                <p>
                  <strong>Applied At:</strong>{" "}
                  {new Date(app.appliedAt._seconds * 1000).toLocaleString()}
                </p>
                <div className="card-buttons">
                  <button
                    className="view-student-btn"
                    onClick={() => setModalData(app)}
                  >
                    View Student Info
                  </button>
                  <button
                    disabled={updatingId === app.id || app.status === "approved"}
                    onClick={() => updateStatus(app.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    disabled={updatingId === app.id || app.status === "rejected"}
                    onClick={() => updateStatus(app.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{modalData.studentName}</h3>
            <p><strong>Email:</strong> {modalData.studentEmail}</p>
            <p><strong>Course:</strong> {modalData.studentCourse}</p>
            <p><strong>Institution:</strong> {modalData.institutionName}</p>
            <p><strong>Graduation Year:</strong> {modalData.graduationYear}</p>
            <p><strong>Skills:</strong> {modalData.studentSkills?.join(", ") || "None"}</p>
            <button className="cancel-btn" onClick={() => setModalData(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;
