
import React from 'react';
import DashboardIcon from '../assets/dashboard-svgrepo-com-2.svg?react';
import MapIcon from '../assets/location-svgrepo-com-2.svg?react';

const Sidebar = () => {
  return (
    <div className="sidebar">      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="#">
              <DashboardIcon />
              <span>DASHBOARD</span>
            </a>
          </li>
          <li className="active">
            <a href="#">
              <MapIcon />
              <span>MAP</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;