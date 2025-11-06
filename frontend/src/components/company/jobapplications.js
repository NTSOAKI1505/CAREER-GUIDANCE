
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getCompanyApplications, updateApplicationStatus } from "../api/jobApplications";
import "./jobapplications.css"

const CompanyApplications = () => {
  const { token } = useContext(UserContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await getCompanyApplications(token);
      if (data.status === "success") setApplications(data.applications);
    };
    fetchApps();
  }, [token]);

  const handleReview = async (id) => {
    const res = await updateApplicationStatus(id, "reviewed", token);
    if (res.status === "success") {
      alert("Status updated!");
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "reviewed" } : a))
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Company Job Applications</h2>

      <ul className="space-y-2">
        {applications.map((app) => (
          <li key={app.id} className="border p-3 rounded">
            <p><strong>Student:</strong> {app.studentName}</p>
            <p><strong>Email:</strong> {app.studentEmail}</p>
            <p><strong>Course:</strong> {app.studentCourse}</p>
            <p><strong>Status:</strong> {app.status}</p>
            {app.status !== "reviewed" && (
              <button
                onClick={() => handleReview(app.id)}
                className="bg-green-600 text-white px-3 py-1 rounded mt-2"
              >
                Mark as Reviewed
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyApplications;
