import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user);
    }
  }, [isAuthenticated, user]);

  const redirectUser = (u) => {
    if (u.role === 'mentor') {
      navigate('/mentor/dashboard', { replace: true });
    } else {
      if (!u.profile_complete || !u.face_registered) {
        navigate('/student/profile', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
        role,
      });

      const { token, user: userData } = response.data;
      login(userData, token);
      redirectUser(userData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      {/* ---- LEFT PANEL ---- */}
      <div
        style={{
          background:
            'linear-gradient(135deg, #0d1117 0%, #161b27 50%, #1a1f35 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            animation: 'float 5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            animation: 'float 7s ease-in-out infinite reverse',
          }}
        />

        {/* Logo */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Face scan animation */}
          <div
            style={{
              width: 140,
              height: 160,
              margin: '0 auto 2rem',
              position: 'relative',
            }}
          >
            {/* Face outline */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50% 50% 45% 45%',
                border: '2px solid rgba(99,102,241,0.4)',
                position: 'relative',
                animation: 'glow 3s infinite',
              }}
            >
              {/* Scanning line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    'linear-gradient(90deg, transparent, #6366f1, transparent)',
                  animation: 'scan 2s ease-in-out infinite',
                  top: '50%',
                }}
              />
              {/* Corner brackets */}
              {[
                { top: -2, left: -2, borderColor: '#6366f1 transparent transparent #6366f1' },
                { top: -2, right: -2, borderColor: '#6366f1 #6366f1 transparent transparent' },
                { bottom: -2, left: -2, borderColor: 'transparent transparent #6366f1 #6366f1' },
                { bottom: -2, right: -2, borderColor: 'transparent #6366f1 #6366f1 transparent' },
              ].map((style, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    border: '3px solid',
                    ...style,
                  }}
                />
              ))}

              {/* Dots (eyes) */}
              <div
                style={{
                  position: 'absolute',
                  top: '38%',
                  left: '25%',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#6366f1',
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '38%',
                  right: '25%',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#6366f1',
                  opacity: 0.8,
                }}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.75rem',
            }}
          >
            AttendAI
          </div>
          <p
            style={{
              color: '#6b7280',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxWidth: 300,
            }}
          >
            AI-powered face recognition attendance system for modern institutions.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '2.5rem',
            }}
          >
            {[
              { icon: '⚡', text: 'Sub-2 second recognition' },
              { icon: '🔒', text: 'JWT-secured sessions' },
              { icon: '📊', text: 'Real-time analytics' },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.75rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                }}
              >
                <span>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- RIGHT PANEL ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Welcome back 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Sign in to access your dashboard.
            </p>
          </div>

          {/* Role selector */}
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`tab-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => { setRole('student'); setError(''); }}
            >
              🎓 Student
            </button>
            <button
              className={`tab-btn ${role === 'mentor' ? 'active' : ''}`}
              onClick={() => { setRole('mentor'); setError(''); }}
            >
              👨‍🏫 Mentor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-required="true"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: 'var(--accent-danger)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" />
                  Signing in...
                </>
              ) : (
                `Login as ${role === 'student' ? 'Student' : 'Mentor'} →`
              )}
            </button>
          </form>

          {/* Footer links */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              Register as Student
            </Link>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            <Link to="/" style={{ color: 'var(--text-muted)' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 1; }
          100% { top: 90%; opacity: 0.2; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.5); border-color: rgba(99,102,241,0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          form > * + * { margin-top: 0; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: linear-gradient(135deg, #0d1117"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
