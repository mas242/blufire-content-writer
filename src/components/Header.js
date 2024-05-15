import React from 'react';
import './Header.css';
import flameLogo from '../assets/BluFire_flame_transparent.png'; // Adjust the path if necessary

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <img src={flameLogo} alt="Blu Fire Logo" className="logo" />
        <div className="text-container">
          <span className="content-writer-title">BluFire AI Content Writer</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
