import React from 'react';
import '../pages/Home.css';

const Footer = () => {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} ShopEase · All rights reserved · Designed with ❤️
    </footer>
  );
};

export default Footer;
