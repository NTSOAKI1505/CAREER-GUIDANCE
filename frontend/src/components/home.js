import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>Career Guidance and Employment System</h1>
        <p>Connecting Students, Institutes, and Companies</p>

        {/* Buttons for Login and Signup */}
        <div className="header-buttons">
          <Link to="/login" className="btn btn-login">
            Getstarted
          </Link>
        </div>
      </header>

      {/* Role Selection */}
      <div className="role-grid">
        <Link to="/institute" className="role-card">
          <h2>Institute</h2>
             <p>Manage faculties and the courses they offer.  
               Oversee student admissions and registrations.  
              Keep track of all academic activities efficiently.</p>
        </Link>

        <Link to="/student" className="role-card">
          <h2>Student</h2>
          <p>Students can explore and apply for various academic courses and job opportunities through the platform, helping them connect with institutions and employers that match their career goals.</p>
        </Link>

        <Link to="/company" className="role-card">
          <h2>Company</h2>
            <p>Post job openings and internships for students.  
Track and manage applications easily.  
                Connect with talented candidates efficiently.</p>
        </Link>

        <Link to="/company" className="role-card">
          <h2>admin</h2>
          <p>allows administrators to manage institutions, faculties, and courses, publish admissions, monitor users, manage company accounts, and generate reports to keep the system organized and up to date</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
