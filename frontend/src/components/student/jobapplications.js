import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./jobapplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StudentJobs = () => {
  const { token } = useContext(UserContext);
  const [companies, setCompanies] = useState([]);
  const [jobsByCompany, setJobsByCompany] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({ coverLetter: "", cvLink: "" });
  const [message, setMessage] = useState("");

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/company/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Fetch jobs for each company
  const fetchJobsForCompanies = async (companyIds) => {
    const allJobs = {};
    await Promise.all(
      companyIds.map(async (companyId) => {
        try {
          const res = await fetch(`${BACKEND_URL}/jobs/company/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.status === "success") {
            allJobs[companyId] = data.jobs;
          }
        } catch (error) {
          console.error(`Error fetching jobs for company ${companyId}:`, error);
          allJobs[companyId] = [];
        }
      })
    );
    setJobsByCompany(allJobs);
  };

  // Fetch companies and their jobs
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCompanies();
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch jobs whenever companies change
  useEffect(() => {
    if (companies.length > 0) {
      const companyIds = companies.map((c) => c.id);
      fetchJobsForCompanies(companyIds);
    }
  }, [companies]);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setFormData({ coverLetter: "", cvLink: "" });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (applying) return;
    setApplying(true);

    try {
      const res = await fetch(`${BACKEND_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          coverLetter: formData.coverLetter,
          cvLink: formData.cvLink,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessage("Application submitted successfully!");
        setShowModal(false);
      } else {
        setMessage(data.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Error applying:", error);
      setMessage("Error submitting application. Try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p>Loading companies and jobs...</p>;

  return (
    <div className="company-jobs-container">
      {message && <p className="success-message">{message}</p>}

      {companies.length === 0 ? (
        <p>No companies available.</p>
      ) : (
        companies.map((company) => (
          <div key={company.id} className="company-section">
            <div className="company-header">
              {company.logoUrl && <img src={company.logoUrl} alt={company.companyName} className="company-logo" />}
              <h2>{company.companyName}</h2>
              <p>{company.location} | {company.industry}</p>
            </div>

            {jobsByCompany[company.id] && jobsByCompany[company.id].length > 0 ? (
              jobsByCompany[company.id].map((job) => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p><strong>Type:</strong> {job.jobType}</p>
                  <p><strong>Salary:</strong> {job.salaryRange}</p>
                  <p><strong>Deadline:</strong>{" "}
                    {new Date(job.applicationDeadline._seconds * 1000).toLocaleDateString()}
                  </p>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Requirements:</strong> {job.requirements.join(", ")}</p>
                  <div className="job-actions">
                    <button onClick={() => handleApplyClick(job)}>Apply</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No jobs posted by this company yet.</p>
            )}
          </div>
        ))
      )}

      {/* Application Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Apply for {selectedJob?.title}</h3>
            <form onSubmit={handleApplySubmit}>
              <textarea
                name="coverLetter"
                placeholder="Write your cover letter..."
                value={formData.coverLetter}
                onChange={handleChange}
                required
              />
              <input
                type="url"
                name="cvLink"
                placeholder="Link to your CV (Google Drive or Dropbox)"
                value={formData.cvLink}
                onChange={handleChange}
                required
              />
              <div className="modal-actions">
                <button type="submit" disabled={applying}>
                  {applying ? "Applying..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={applying}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
