import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onNewTaskClick }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <div className="brand-title">FlowTask</div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="nav-actions">
            <button className="btn btn-primary" onClick={onNewTaskClick}>
              + New Task
            </button>
            <div className="user-badge">
              <span>👤</span>
              <span>{user?.name || 'User'}</span>
            </div>
            <button
              className="btn btn-outline"
              onClick={logout}
              title="Log out of application"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
