import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const StudentRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/api/auth/mentors');
        setMentors(res.data);
      } catch {
        setMentors([]);
      } finally {
        setMentorsLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const getInitials = (n = '') =>
    n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Invalid email format.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    if (!selectedMentorId) errs.mentor = 'Please select a mentor.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        mentor_id: selectedMentorId,
      });
      navigate('/login', {
        state: { successMessage: 'Account created! Please login to continue.' },
      });
    } catch (err) {
      setGlobalError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-card)',
          animation: 'slideIn 0.4s ease',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
            }}
          >
            📝
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '0.35rem',
            }}
          >
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join AttendAI as a student
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Email row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                autoComplete="name"
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-email">
                Email <span className="required">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>
          </div>

          {/* Password row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  autoComplete="new-password"
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
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <div className="form-error">⚠ {errors.password}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password <span className="required">*</span>
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div className="form-error">⚠ {errors.confirmPassword}</div>
              )}
            </div>
          </div>

          {/* Mentor selection */}
          <div style={{ marginTop: '1.5rem' }}>
            <label className="form-label">
              Select Your Mentor <span className="required">*</span>
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Your mentor will manage your attendance records.
            </p>

            {mentorsLoading ? (
              <div className="loading-state" style={{ padding: '2rem' }}>
                <div className="spinner" />
                <span>Loading mentors...</span>
              </div>
            ) : mentors.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <div className="empty-state-icon">👨‍🏫</div>
                <div className="empty-state-title">No mentors available</div>
              </div>
            ) : (
              <div className="mentor-cards-grid">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className={`mentor-select-card ${selectedMentorId === mentor.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedMentorId(mentor.id); clearError('mentor'); }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedMentorId === mentor.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedMentorId(mentor.id);
                        clearError('mentor');
                      }
                    }}
                  >
                    <div className="mentor-avatar">{getInitials(mentor.name)}</div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {mentor.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {mentor.email}
                      </div>
                    </div>
                    {selectedMentorId === mentor.id && (
                      <span style={{ marginLeft: 'auto', color: 'var(--accent-success)', fontSize: '1.1rem' }}>
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.mentor && (
              <div className="form-error" style={{ marginTop: '0.5rem' }}>
                ⚠ {errors.mentor}
              </div>
            )}
          </div>

          {/* Global error */}
          {globalError && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginTop: '1.25rem',
                color: 'var(--accent-danger)',
                fontSize: '0.875rem',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              ⚠️ {globalError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '1.5rem', padding: '0.875rem', fontSize: '1rem' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="spinner spinner-sm" />
                Creating account...
              </>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @media (max-width: 560px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentRegistration;
