// src/components/company/CompanyJobs.js
import React, { useState, useEffect, useContext } from "react";
import { createJob, getCompanyJobs } from "../../api/companyjobs";
import { UserContext } from "../../contexts/UserContext";
import "./companyjobs.css";

const CompanyJobs = () => {
  const { user, token } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load company jobs on page load
  useEffect(() => {
    if (user && token) {
      fetchCompanyJobs();
    }
  }, [user, token]);

  const fetchCompanyJobs = async () => {
    try {
      setError("");
      const res = await getCompanyJobs(user._id, token);
      setJobs(res);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    }
  };

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("Submitting job:", jobData);
      const newJob = await createJob(jobData, token);
      setSuccess("Job saved successfully!");
      setJobs([...jobs, newJob]);
      setJobData({ title: "", description: "", location: "", salary: "" });
    } catch (err) {
      console.error("Error saving job:", err.response || err);
      setError(err.response?.data?.message || "Failed to save job. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-jobs-container">
      <h2>Manage Job Listings</h2>

      <form onSubmit={handleSubmit} className="job-form">
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={jobData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={jobData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={jobData.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="salary"
          placeholder="Salary (optional)"
          value={jobData.salary}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Job"}
        </button>

        {/* Error or Success messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>

      <h3>Existing Jobs</h3>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary || "N/A"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyJobs;
