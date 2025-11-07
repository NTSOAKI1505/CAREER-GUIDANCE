import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./jobapplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const StudentJobs = () => {
  const { token } = useContext(UserContext);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndCompanies = async () => {
      try {
        // Fetch all jobs
        const jobsRes = await fetch(`${BACKEND_URL}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobsRes.json();

        if (jobsData.status !== "success" || !jobsData.jobs.length) {
          setCompanyJobs([]);
          return;
        }

        const jobs = jobsData.jobs;

        // Fetch all companies in one request
        const companiesRes = await fetch(`${BACKEND_URL}/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companiesData = await companiesRes.json();

        if (companiesData.status !== "success" || !companiesData.companies.length) {
          setCompanyJobs([]);
          return;
        }

        // Map companyId -> companyName
        const companyMap = companiesData.companies.reduce((acc, company) => {
          acc[company.id] = company.name;
          return acc;
        }, {});

        // Group jobs by companyId
        const companyIdsWithJobs = [...new Set(jobs.map(job => job.companyId))];
        const groupedJobs = companyIdsWithJobs.map(companyId => ({
          companyId,
          companyName: companyMap[companyId] || "Unknown Company",
          jobs: jobs.filter(job => job.companyId === companyId)
        }));

        setCompanyJobs(groupedJobs);

      } catch (err) {
        console.error("Error fetching jobs or companies:", err);
        setCompanyJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndCompanies();
  }, [token]);

  if (loading) return <p>Loading jobs...</p>;
  if (!companyJobs.length) return <p>No jobs available.</p>;

  return (
    <div className="student-jobs-container">
      {companyJobs.map(({ companyId, companyName, jobs }) => (
        <div key={companyId} className="company-section">
          <h2 className="company-title">{companyName}</h2>
          <div className="company-jobs">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <h3 className="job-title">{job.title}</h3>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Type:</strong> {job.jobType}</p>
                <p><strong>Salary:</strong> {job.salaryRange}</p>
                <p><strong>Deadline:</strong> {new Date(job.applicationDeadline._seconds * 1000).toLocaleDateString()}</p>
                <p className="job-description">{job.description}</p>
                <p className="job-requirements"><strong>Requirements:</strong> {job.requirements.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentJobs;
