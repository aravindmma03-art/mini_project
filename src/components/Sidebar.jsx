import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENTOR_NAV = [
  { path: '/mentor/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/mentor/students', icon: '👥', label: 'Students' },
  { path: '/mentor/sessions', icon: '📡', label: 'Live Sessions' },
  { path: '/mentor/attendance', icon: '📋', label: 'Attendance' },
  { path: '/mentor/unknown-faces', icon: '🔍', label: 'Unknown Faces' },
];

const STUDENT_NAV = [
  { path: '/student/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/mentor/attendance', icon: '📋', label: 'My Attendance' },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'mentor' ? MENTOR_NAV : STUDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <span style={{ fontSize: '1.2rem' }}>👁️</span>
        </div>
        <span className="sidebar-brand-name">AttendAI</span>
      </div>

      {/* Navigation */}
      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path} className="sidebar-nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
