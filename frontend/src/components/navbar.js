import React from "react";
import "./navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">CareerConnect</div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
