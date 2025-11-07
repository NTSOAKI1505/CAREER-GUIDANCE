import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./jobapplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StudentJobs = () => {
  const { token } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Fetch jobs and company info
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRes = await fetch(`${BACKEND_URL}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobsRes.json();
        if (jobsData.status !== "success" || !jobsData.jobs.length) {
          setJobs([]);
          return;
        }

        const allJobs = await Promise.all(
          jobsData.jobs.map(async (job) => {
            const res = await fetch(`${BACKEND_URL}/company/profile/${job.companyId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const companyData = await res.json();
            return {
              ...job,
              companyName: companyData.profile?.companyName || "Unknown Company",
              companyInfo: companyData.profile || null,
            };
          })
        );

        setJobs(allJobs);
      } catch (err) {
        console.error("Error fetching jobs or companies:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  // Fetch current user's job applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/jobApplications/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "success") setApplications(data.applications);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, [token]);

  const getApplicationStatus = (jobId) => {
    const app = applications.find(a => a.jobId === jobId);
    return app ? app.status : null; // pending, reviewed, approved, rejected
  };

  // Apply for job
  const handleApply = async (job) => {
    if (getApplicationStatus(job.id)) return; // prevent re-apply
    setApplyingJobId(job.id);

    try {
      const res = await fetch(`${BACKEND_URL}/jobApplications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setApplications(prev => [...prev, data.application]);
      } else {
        alert(data.message || "Failed to apply");
      }
    } catch (err) {
      console.error("Error applying:", err);
      alert("Error applying for job");
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleViewCompany = (companyInfo) => setModalData(companyInfo);
  const closeModal = () => setModalData(null);

  if (loading) return <p>Loading jobs...</p>;
  if (!jobs.length) return <p>No jobs available.</p>;

  return (
    <div className="student-jobs-container">
      {jobs.map((job) => {
        const status = getApplicationStatus(job.id);
        return (
          <div key={job.id} className="job-card">
            <h4 className="company-name">{job.companyName}</h4>
            <h3 className="job-title">{job.title}</h3>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.jobType}</p>
            <p><strong>Salary:</strong> {job.salaryRange || "N/A"}</p>
            <p>
              <strong>Deadline:</strong>{" "}
              {job.applicationDeadline
                ? new Date(job.applicationDeadline._seconds * 1000).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="job-description">{job.description}</p>
            <p className="job-requirements">
              <strong>Requirements:</strong>{" "}
              {job.requirements?.length ? job.requirements.join(", ") : "None"}
            </p>

            <div className="job-buttons">
              <button
                className="apply-btn"
                disabled={!!status || applyingJobId === job.id}
                onClick={() => handleApply(job)}
              >
                {applyingJobId === job.id
                  ? "Applying..."
                  : status === "pending"
                  ? "Applied (Pending)"
                  : status === "reviewed"
                  ? "Reviewed"
                  : status === "approved"
                  ? "Approved ✅"
                  : status === "rejected"
                  ? "Rejected ❌"
                  : "Apply"}
              </button>

              {job.companyInfo && (
                <button
                  className="view-company-btn"
                  onClick={() => handleViewCompany(job.companyInfo)}
                >
                  View Company Info
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Company Info Modal */}
      {modalData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modalData.companyName}</h3>
            <p><strong>Location:</strong> {modalData.location}</p>
            <p><strong>Industry:</strong> {modalData.industry}</p>
            <p><strong>Description:</strong> {modalData.description}</p>
            <p><strong>Website:</strong> <a href={modalData.website} target="_blank" rel="noreferrer">{modalData.website}</a></p>
            <p><strong>Contact Email:</strong> {modalData.contactEmail}</p>
            <p><strong>Contact Phone:</strong> {modalData.contactPhone}</p>
            <button className="cancel-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
