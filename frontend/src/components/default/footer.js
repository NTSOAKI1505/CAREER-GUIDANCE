import React from "react";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} CareerConnect | All Rights Reserved</p>
      <div className="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/contact">Contact Us</a>
      </div>
    </footer>
  );
}

export default Footer;
