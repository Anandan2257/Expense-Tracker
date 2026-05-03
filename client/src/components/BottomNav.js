import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiList, FiPieChart, FiTarget, FiUser } from 'react-icons/fi';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <FiHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiList />
        <span>History</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiPieChart />
        <span>Stats</span>
      </NavLink>
      <NavLink to="/budget" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiTarget />
        <span>Budget</span>
      </NavLink>
      <NavLink to="/account" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FiUser />
        <span>Account</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
