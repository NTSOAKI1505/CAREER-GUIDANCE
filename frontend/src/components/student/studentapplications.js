import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./studentapplications.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Tips
const facultyTips = [
  "Popular program among students",
  "Good starting point for beginners",
  "Highly recommended by alumni",
  "New faculty with emerging courses",
];

const courseTips = [
  "Limited seats available",
  "Beginner-friendly course",
  "Includes practical hands-on projects",
  "High demand for job placements",
];

function getRandomTip(tips) {
  return tips[Math.floor(Math.random() * tips.length)];
}

const Tooltip = ({ children, tip }) => (
  <div className="tooltip-container">
    {children}
    {tip && <div className="tooltip-box">{tip}</div>}
  </div>
);

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
  const [hoverTips, setHoverTips] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch institutions
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

        // 2️⃣ Fetch faculties concurrently for all institutions
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

        // 3️⃣ Fetch courses concurrently for all faculties
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

        // 4️⃣ Fetch user applications
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

  if (loading)
    return (
      <div className="applications-container">
        <p>Discovering amazing institutions for you...</p>
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
              const appliedDate = app.applicationDate ? new Date(app.applicationDate._seconds * 1000).toLocaleDateString() : "N/A";

              return (
                <li key={app.id}>
                  <strong>{institutionName}</strong> → {facultyName} → {courseName} | Status: {app.status} | Applied on: {appliedDate}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <h1 className="page-title">Find Your Perfect Program</h1>
      <div className="institutions-grid">
        {institutions.map((inst) => (
          <div key={inst.id} className="institution-card">
            <img src={inst.logoUrl || "/placeholders/institution.png"} alt={`${inst.institutionName} logo`} className="card-icon" />
            <h3>{inst.institutionName}</h3>
            <p>{inst.description || "No description yet. Explore the programs below!"}</p>
            <button className="expand-btn" onClick={() => toggleInstitution(inst.id)}>
              {expandedIds.includes(inst.id) ? "▲ Hide Programs" : "▼ Explore Programs"}
            </button>

            {expandedIds.includes(inst.id) &&
              Object.values(allFacultiesMap)
                .filter((f) => f.institutionId === inst.id)
                .map((faculty) => (
                  <Tooltip key={faculty.id} tip={hoverTips[faculty.id]}>
                    <div
                      className="faculty-card"
                      onMouseEnter={() => setHoverTips((prev) => ({ ...prev, [faculty.id]: getRandomTip(facultyTips) }))}
                      onMouseLeave={() => setHoverTips((prev) => ({ ...prev, [faculty.id]: null }))}
                    >
                      <h4>{faculty.facultyName}</h4>
                      <p>{faculty.description || "Explore courses offered by this faculty!"}</p>
                      <p>Dean: {faculty.deanName || "Not assigned yet"}</p>
                      <button className="expand-btn" onClick={() => toggleFaculty(faculty.id)}>
                        {expandedFaculties[faculty.id] ? "▲ Hide Courses" : "▼ Courses"}
                      </button>

                      {expandedFaculties[faculty.id] &&
                        Object.values(allCoursesMap)
                          .filter((c) => c.facultyId === faculty.id)
                          .map((course) => (
                            <Tooltip key={course.id} tip={hoverTips[course.id]}>
                              <div
                                className="course-card"
                                onMouseEnter={() => setHoverTips((prev) => ({ ...prev, [course.id]: getRandomTip(courseTips) }))}
                                onMouseLeave={() => setHoverTips((prev) => ({ ...prev, [course.id]: null }))}
                              >
                                <h5>{course.courseName}</h5>
                                <p>
                                  {course.courseCode || "Code N/A"} | 🎓 {course.credits || "TBD"} Credits | ⏱️{" "}
                                  {course.duration || "TBD"}
                                </p>
                                <p>{course.description || "No description available. Apply to see full details!"}</p>
                                <button
                                  className={`apply-btn ${applicationStatuses[course.id]?.toLowerCase() || ""}`}
                                  onClick={() => applyToCourse(course.id)}
                                  disabled={!!applicationStatuses[course.id]}
                                >
                                  {applicationStatuses[course.id] || "Apply Now"}
                                </button>
                              </div>
                            </Tooltip>
                          ))}
                    </div>
                  </Tooltip>
                ))}
          </div>
        ))}
      </div>
    </div>
  );
}
