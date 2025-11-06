import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./companyjobs.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CompanyJobs = () => {
  const { token } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false); // 🟢 NEW: Tracks "saving"/"creating" state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "",
    salaryRange: "",
    applicationDeadline: "",
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/jobs/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setJobs(data.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create or update job
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🟢 Prevent double submit
    if (saving) return;
    setSaving(true);

    try {
      const method = editingJobId ? "PUT" : "POST";
      const url = editingJobId
        ? `${BACKEND_URL}/jobs/${editingJobId}`
        : `${BACKEND_URL}/jobs`;

      const payload = {
        ...formData,
        requirements: formData.requirements.split(",").map((r) => r.trim()),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessage(editingJobId ? "Job updated successfully!" : "Job created successfully!");
        setFormData({
          title: "",
          description: "",
          requirements: "",
          location: "",
          jobType: "",
          salaryRange: "",
          applicationDeadline: "",
        });
        setEditingJobId(null);
        setShowModal(false);
        fetchJobs();
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      setMessage("Error saving job. Try again.");
    } finally {
      setSaving(false); // 🟢 Reset saving state
    }
  };

  const handleEdit = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join(", "),
      location: job.location,
      jobType: job.jobType,
      salaryRange: job.salaryRange,
      applicationDeadline: new Date(job.applicationDeadline._seconds * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessage("Job deleted successfully!");
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleAddJob = () => {
    setEditingJobId(null);
    setFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      jobType: "",
      salaryRange: "",
      applicationDeadline: "",
    });
    setShowModal(true);
  };

  return (
    <div className="company-jobs-container">
      <div className="jobs-header">
        <h2>Manage Job Listings</h2>
        <button className="add-job-btn" onClick={handleAddJob}>
          +
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Type:</strong> {job.jobType}</p>
              <p><strong>Salary:</strong> {job.salaryRange}</p>
              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(job.applicationDeadline._seconds * 1000).toLocaleDateString()}
              </p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Requirements:</strong> {job.requirements.join(", ")}</p>
              <div className="job-actions">
                <button onClick={() => handleEdit(job)}>Edit</button>
                <button onClick={() => handleDelete(job.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingJobId ? "Edit Job" : "Create Job"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Job Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Job Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="requirements"
                placeholder="Requirements (comma separated)"
                value={formData.requirements}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="jobType"
                placeholder="Job Type (e.g. Full-time)"
                value={formData.jobType}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="salaryRange"
                placeholder="Salary Range"
                value={formData.salaryRange}
                onChange={handleChange}
              />
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
              />
              <div className="modal-actions">
                {/* 🟢 Disable button while saving */}
                <button type="submit" disabled={saving}>
                  {saving
                    ? editingJobId
                      ? "Updating..."
                      : "Creating..."
                    : editingJobId
                    ? "Update"
                    : "Create"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving} // 🟢 Prevent closing while saving
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

export default CompanyJobs;
