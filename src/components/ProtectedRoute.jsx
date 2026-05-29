import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards a route by role.
 * For students: if profile_complete is false → /student/profile
 * Props: { children, role } where role is 'student' | 'mentor'
 */
const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Not logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // Student-specific: must complete profile and face registration
  if (role === 'student') {
    const currentPath = window.location.pathname;
    // If profile not complete and not already on profile page
    if (!user.profile_complete && currentPath !== '/student/profile') {
      return <Navigate to="/student/profile" replace />;
    }
    // If profile complete but face not registered and not on profile page
    if (user.profile_complete && !user.face_registered && currentPath !== '/student/profile') {
      return <Navigate to="/student/profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
