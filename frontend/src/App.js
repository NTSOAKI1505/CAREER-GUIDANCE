// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/default/home";
import Navbar from "./components/default/navbar";
import Footer from "./components/default/footer";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import StudentProfile from "./components/student/studentprofile";
import InstitutionProfile from "./components/institution/institutionprofile";
import CompanyProfile from "./components/company/companyprofile";
import AdminProfile from "./components/admin/adminprofile";

import JobApplications from "./components/company/jobapplications";
import InstitutionFaculty from "./components/institution/InstitutionFaculty";
import StudentApplications from "./components/student/studentapplications";
import InstitutionApplications from "./components/institution/institutionApplications";
import InstitutionAdmissions  from "./components/institution/institutionAdmissions";
import StudentAdmissions from "./components/student/studentadmissions";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserProvider> {/* Wrap the entire app */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/studentprofile" element={<StudentProfile />} />
          <Route path="/institutionprofile" element={<InstitutionProfile />} />
          <Route path="/companyprofile" element={<CompanyProfile />} />
          <Route path="/adminprofile" element={<AdminProfile />} />
          <Route path="/jobapplications" element={<JobApplications />} />
          <Route path="/faculties" element={<InstitutionFaculty />} />
          <Route path="/studentapplications" element={<StudentApplications />} />
          <Route path="/institutionapplications" element={<InstitutionApplications />} />
          <Route path="/institutionadmissions" element={<InstitutionAdmissions />} />
          <Route path="/studentadmissions" element={<StudentAdmissions />} />
          {/* Add other routes here (admin, student, institute, company) */}
        </Routes>
        <Footer />
      </Router>
    </UserProvider>
  );
}

export default App;
