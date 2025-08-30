
import React from 'react';
import SagerLogo from '../assets/sager-logo.svg?react';
import CaptureIcon from '../assets/capture-svgrepo-com.svg?react';
import LanguageIcon from '../assets/language-svgrepo-com.svg?react';
import BellIcon from '../assets/bell.svg?react';

const Header = () => {
  return (
    <header className="header">
      {/* CHILD 1: The Logo */}
      <div className="header-logo">
        <SagerLogo />
      </div>
      <div className="header-right-side">
        <div className="header-icons">
          <button><CaptureIcon /></button>
          <button><LanguageIcon /></button>
          <button className="notification">
            <BellIcon />
            <span>5</span>
          </button>
        </div>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Hello, Mohammed Omar</span>
            <span className="user-role">Technical Support</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;