import React from 'react';
import './Header.css';
import flameLogo from '../assets/BluFire_flame_transparent.png'; // Adjust the path if necessary

const Header = ({ onClearStorage }) => {
  return (
    <header className="header">
      <div className="header-content">
        <img src={flameLogo} alt="Blu Fire Logo" className="logo" />
        <div className="text-container">
          <span className="content-writer-title">BluFire AI Content Writer</span>
        </div>
      </div>
      <button className="clear-storage-button" onClick={onClearStorage}>Clear Storage</button>
    </header>
  );
};

export default Header;
