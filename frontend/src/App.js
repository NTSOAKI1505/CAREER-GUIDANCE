// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Login from "./components/login";
import Signup from "./components/signup";
import StudentProfile from "./components/studentprofile";
import InstitutionProfile from "./components/institutionprofile";
import CompanyProfile from "./components/companyprofile";
import AdminProfile from "./components/adminprofile";
import { UserProvider } from "./contexts/UserContext";
import Admin  from "./components/admin";

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
          <Route path="/admin" element={<Admin />} />
          {/* Add other routes here (admin, student, institute, company) */}
        </Routes>
        <Footer />
      </Router>
    </UserProvider>
  );
}

export default App;
