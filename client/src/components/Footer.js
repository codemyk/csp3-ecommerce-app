// src/components/Footer.js
import React from 'react';
import { Container } from 'react-bootstrap';
import '../App.css'; // Optional for custom styling

const Footer = () => {
  return (
    <footer className="footer-full text-white py-3 mt-5">
      <div className="text-center">
        <small>&copy; {new Date().getFullYear()} Generix Drugstore. All rights reserved.</small>
      </div>
    </footer>
  );
};

export default Footer;