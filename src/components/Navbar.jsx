import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/mentor/dashboard': 'Dashboard',
  '/mentor/students': 'Students',
  '/mentor/sessions': 'Live Sessions',
  '/mentor/attendance': 'Attendance Records',
  '/mentor/unknown-faces': 'Unknown Faces',
  '/student/dashboard': 'My Dashboard',
  '/student/profile': 'Profile Setup',
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  const pageTitle = PAGE_TITLES[location.pathname] || 'AttendAI';

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.body.classList.toggle('light-mode', !next);
      return next;
    });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">{pageTitle}</span>
      </div>
      <div className="navbar-right">
        {/* Theme toggle */}
        <button
          className="navbar-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Notification bell */}
        <button className="navbar-btn" title="Notifications" aria-label="Notifications">
          🔔
        </button>

        {/* User name */}
        {user && (
          <span className="navbar-user-name">
            {getInitials(user.name)}
            <span style={{ marginLeft: '0.5rem' }}>{user.name}</span>
          </span>
        )}

        {/* User avatar */}
        {user && (
          <div
            className="sidebar-avatar"
            style={{ width: 32, height: 32, fontSize: '0.75rem' }}
          >
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
