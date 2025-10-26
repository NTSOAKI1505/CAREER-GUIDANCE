// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Login from "./components/login";
import Signup from "./components/signup";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Add other routes here (admin, student, institute, company) */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
