import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>🎓 CareerLink Management System</h1>
        <p>Connecting Students, Institutes, and Companies</p>
      </header>

      {/* Role Selection */}
      <div className="role-grid">
        <Link to="/admin" className="role-card">
          <h2>Admin</h2>
          <p>Manage institutes, companies, and reports</p>
        </Link>

        <Link to="/institute" className="role-card">
          <h2>Institute</h2>
          <p>Manage faculties, courses, and student admissions</p>
        </Link>

        <Link to="/student" className="role-card">
          <h2>Student</h2>
          <p>Apply for courses and job opportunities</p>
        </Link>

        <Link to="/company" className="role-card">
          <h2>Company</h2>
          <p>Post jobs and manage student applications</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
