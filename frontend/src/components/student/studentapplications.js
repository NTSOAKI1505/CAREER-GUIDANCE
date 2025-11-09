import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./studentapplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Applications() {
  const { user, token } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [userApplications, setUserApplications] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [allInstitutionsMap, setAllInstitutionsMap] = useState({});
  const [allFacultiesMap, setAllFacultiesMap] = useState({});
  const [allCoursesMap, setAllCoursesMap] = useState({});
  const [expandedIds, setExpandedIds] = useState([]);
  const [expandedFaculties, setExpandedFaculties] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      try {
        // Institutions
        const instRes = await fetch(`${BACKEND_URL}/institution/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const instData = await instRes.json();
        if (!instRes.ok) throw new Error(instData.message || "Failed to fetch institutions");
        const instList = instData.profiles || [];
        setInstitutions(instList);
        const instMap = {};
        instList.forEach((i) => (instMap[i.id] = i));
        setAllInstitutionsMap(instMap);

        // Faculties
        const facultiesResponses = await Promise.all(
          instList.map((inst) =>
            fetch(`${BACKEND_URL}/faculty/institution/${inst.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          )
        );

        const facultiesMap = {};
        facultiesResponses.forEach((data, index) => {
          if (data.faculties) {
            data.faculties.forEach((f) => {
              facultiesMap[f.id] = { ...f, institutionId: instList[index].id };
            });
          }
        });
        setAllFacultiesMap(facultiesMap);

        // Courses
        const facultyIds = Object.keys(facultiesMap);
        const coursesResponses = await Promise.all(
          facultyIds.map((fid) =>
            fetch(`${BACKEND_URL}/course/faculty/${fid}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          )
        );

        const coursesMap = {};
        coursesResponses.forEach((data, index) => {
          if (data.courses) {
            data.courses.forEach((c) => {
              coursesMap[c.id] = { ...c, facultyId: facultyIds[index] };
            });
          }
        });
        setAllCoursesMap(coursesMap);

        // User Applications
        const appRes = await fetch(`${BACKEND_URL}/application/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appData = await appRes.json();
        if (!appRes.ok) throw new Error(appData.message || "Failed to fetch applications");
        setUserApplications(appData.applications || []);

        const statusMap = {};
        (appData.applications || []).forEach((app) => {
          statusMap[app.courseId] = app.status;
        });
        setApplicationStatuses(statusMap);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const toggleInstitution = (id) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    setExpandedFaculties({});
  };

  const toggleFaculty = (id) => {
    setExpandedFaculties((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyToCourse = async (courseId) => {
    if (!user || !token) {
      showToast("You must be logged in to apply.", "error");
      return;
    }

    const course = allCoursesMap[courseId];
    const faculty = course ? allFacultiesMap[course.facultyId] : null;
    const institutionId = faculty ? faculty.institutionId : null;

    const appliedCount = userApplications.filter((app) => app.institutionId === institutionId).length;
    if (appliedCount >= 2) {
      showToast("You can only apply for 2 courses per institution.", "error");
      return;
    }

    setApplicationStatuses((prev) => ({ ...prev, [courseId]: "Pending" }));

    try {
      const res = await fetch(`${BACKEND_URL}/application`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: user.id, courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit application");

      setApplicationStatuses((prev) => ({ ...prev, [courseId]: data.application.status }));
      setUserApplications((prev) => [...prev, data.application]);
      showToast("Application submitted successfully!", "success");
    } catch (err) {
      setApplicationStatuses((prev) => ({ ...prev, [courseId]: null }));
      showToast(err.message, "error");
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchSearch =
      inst.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  if (loading)
    return (
      <div className="applications-container">
        <p>Loading institutions and programs...</p>
      </div>
    );

  if (!institutions.length)
    return (
      <div className="applications-container">
        <h3>No institutions available at the moment</h3>
      </div>
    );

  return (
    <div className="applications-container">
      {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="guidance-box">
        <h2>Welcome, Future Student!</h2>
        <p>
          Explore top institutions across Lesotho and find the program that matches your dream career.  
          Use the <strong>search bar</strong> below to look for schools or programs.  
          Click <em>“Explore Programs”</em> to view faculties and courses, then <strong>Apply</strong> directly from here.
        </p>
      </div>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search by institution or program name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Institutions</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {userApplications.length > 0 && (
        <div className="user-applications">
          <h3>Your Applications</h3>
          <ul>
            {userApplications.map((app) => {
              const course = allCoursesMap[app.courseId];
              const faculty = course ? allFacultiesMap[course.facultyId] : null;
              const institution = faculty ? allInstitutionsMap[faculty.institutionId] : null;
              const institutionName = institution?.institutionName || "Unknown Institution";
              const facultyName = faculty?.facultyName || "Unknown Faculty";
              const courseName = course?.courseName || "Unknown Course";
              const appliedDate = app.applicationDate
                ? new Date(app.applicationDate._seconds * 1000).toLocaleDateString()
                : "N/A";

              return (
                <li key={app.id}>
                  <strong>{institutionName}</strong> → {facultyName} → {courseName} | Status:{" "}
                  <span className={`status ${app.status.toLowerCase()}`}>{app.status}</span> | Applied on: {appliedDate}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <h1 className="page-title">Find Your Perfect Program</h1>
      <div className="institutions-grid">
        {filteredInstitutions.map((inst) => (
          <div key={inst.id} className="institution-card">
            <img
              src={inst.logoUrl || "/placeholders/institution.png"}
              alt={`${inst.institutionName} logo`}
              className="card-icon"
            />
            <h3>{inst.institutionName}</h3>
            <p>{inst.description || "No description yet. Explore the programs below!"}</p>
            <button className="expand-btn" onClick={() => toggleInstitution(inst.id)}>
              {expandedIds.includes(inst.id) ? "▲ Hide Programs" : "▼ Explore Programs"}
            </button>

            {expandedIds.includes(inst.id) &&
              Object.values(allFacultiesMap)
                .filter((f) => f.institutionId === inst.id)
                .map((faculty) => (
                  <div key={faculty.id} className="faculty-card">
                    <h4>{faculty.facultyName}</h4>
                    <p>{faculty.description || "Explore courses offered by this faculty!"}</p>
                    <p>Dean: {faculty.deanName || "Not assigned yet"}</p>
                    <button className="expand-btn" onClick={() => toggleFaculty(faculty.id)}>
                      {expandedFaculties[faculty.id] ? "▲ Hide Courses" : "▼ View Courses"}
                    </button>

                    {expandedFaculties[faculty.id] &&
                      Object.values(allCoursesMap)
                        .filter((c) => c.facultyId === faculty.id)
                        .map((course) => (
                          <div key={course.id} className="course-card">
                            <h5>{course.courseName}</h5>
                            <p>
                              {course.courseCode || "Code N/A"} | {course.credits || "TBD"} Credits |{" "}
                              {course.duration || "TBD"}
                            </p>
                            <p>{course.description || "No description available."}</p>
                            <button
                              className={`apply-btn ${applicationStatuses[course.id]?.toLowerCase() || ""}`}
                              onClick={() => applyToCourse(course.id)}
                              disabled={!!applicationStatuses[course.id]}
                            >
                              {applicationStatuses[course.id] || "Apply Now"}
                            </button>
                          </div>
                        ))}
                  </div>
                ))}
          </div>
        ))}
      </div>
    </div>
  );
}
