import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./perspectivestudents.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PerspectiveStudents() {
  const { token } = useContext(UserContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BACKEND_URL}/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch student profiles");

        const studentProfiles = (data.profiles || []).filter(p => p.userInfo?.role === "student");
        setStudents(studentProfiles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStudentProfiles();
  }, [token]);

  if (loading) return <div className="students-container">Loading students...</div>;
  if (error) return <div className="students-container error">{error}</div>;
  if (!students.length) return <div className="students-container">No students found.</div>;

  return (
    <div className="students-container">
      <h1>All Students</h1>
      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Profile Pic</th>
              <th>Name</th>
              <th>Email</th>
              <th>Institution</th>
              <th>Course</th>
              <th>Year</th>
              <th>Bio</th>
              <th>Skills</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>
                  {student.profilePic && (
                    <img
                      src={student.profilePic}
                      alt={`${student.userInfo?.firstName} ${student.userInfo?.lastName}`}
                      className="table-profile-pic"
                    />
                  )}
                </td>
                <td>{student.userInfo?.firstName} {student.userInfo?.lastName}</td>
                <td>{student.userInfo?.email}</td>
                <td>{student.institution}</td>
                <td>{student.course}</td>
                <td>{student.yearOfStudy}</td>
                <td>{student.bio}</td>
                <td>{student.skills?.join(", ") || "None"}</td>
                <td>
                  {student.resumeUrl ? (
                    <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
