import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FaceUploadModal from '../components/FaceUploadModal';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA'];
const YEARS = ['1st', '2nd', '3rd', '4th'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const WizardStep = ({ number, label, status }) => (
  <div className={`wizard-step ${status}`}>
    <div className="wizard-step-number">
      {status === 'completed' ? '✓' : number}
    </div>
    <div className="wizard-step-label">{label}</div>
  </div>
);

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Determine starting step
  const [step, setStep] = useState(user?.profile_complete ? 2 : 1);

  // Step 1 fields
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Step 2
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(user?.face_registered || false);

  useEffect(() => {
    // If user already completed profile, skip to step 2
    if (user?.profile_complete) setStep(2);
    if (user?.face_registered) setFaceRegistered(true);
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!rollNumber.trim()) errs.rollNumber = 'Roll number is required.';
    if (!department) errs.department = 'Department is required.';
    if (!year) errs.year = 'Year is required.';
    if (!section) errs.section = 'Section is required.';
    return errs;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSaveError('');

    try {
      await api.put('/api/students/me/profile', {
        roll_number: rollNumber.trim(),
        department,
        year,
        section,
        phone: phone.trim(),
      });
      updateUser({ profile_complete: true });
      setStep(2);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFaceSuccess = () => {
    updateUser({ face_registered: true });
    setFaceRegistered(true);
    setIsFaceModalOpen(false);
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const getStepStatus = (n) => {
    if (n < step) return 'completed';
    if (n === step) return 'active';
    return '';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          animation: 'slideIn 0.4s ease',
        }}
      >
        {/* Progress Wizard */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="wizard-steps">
            <WizardStep number={1} label="Complete Profile" status={getStepStatus(1)} />
            <div className={`wizard-connector ${step > 1 ? 'completed' : ''}`} />
            <WizardStep number={2} label="Register Face" status={getStepStatus(2)} />
          </div>

          {/* ---- STEP 1 — Profile Form ---- */}
          {step === 1 && (
            <form onSubmit={handleSaveProfile} noValidate>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginBottom: '0.4rem',
                  color: 'var(--text-primary)',
                }}
              >
                Complete Your Profile
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We need a few details before you can start marking attendance.
              </p>

              {/* Roll Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="roll">
                  Roll Number <span className="required">*</span>
                </label>
                <input
                  id="roll"
                  type="text"
                  className={`input-field ${errors.rollNumber ? 'input-error' : ''}`}
                  placeholder="e.g. 21CS001"
                  value={rollNumber}
                  onChange={(e) => { setRollNumber(e.target.value); clearError('rollNumber'); }}
                />
                {errors.rollNumber && <div className="form-error">⚠ {errors.rollNumber}</div>}
              </div>

              {/* Department + Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="dept">
                    Department <span className="required">*</span>
                  </label>
                  <select
                    id="dept"
                    className={`input-field ${errors.department ? 'input-error' : ''}`}
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); clearError('department'); }}
                  >
                    <option value="">Select...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <div className="form-error">⚠ {errors.department}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="year">
                    Year <span className="required">*</span>
                  </label>
                  <select
                    id="year"
                    className={`input-field ${errors.year ? 'input-error' : ''}`}
                    value={year}
                    onChange={(e) => { setYear(e.target.value); clearError('year'); }}
                  >
                    <option value="">Select...</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y} Year</option>
                    ))}
                  </select>
                  {errors.year && <div className="form-error">⚠ {errors.year}</div>}
                </div>
              </div>

              {/* Section + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="section">
                    Section <span className="required">*</span>
                  </label>
                  <select
                    id="section"
                    className={`input-field ${errors.section ? 'input-error' : ''}`}
                    value={section}
                    onChange={(e) => { setSection(e.target.value); clearError('section'); }}
                  >
                    <option value="">Select...</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                  {errors.section && <div className="form-error">⚠ {errors.section}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="phone">
                    Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="input-field"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {saveError && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    marginTop: '1rem',
                    color: 'var(--accent-danger)',
                    fontSize: '0.875rem',
                  }}
                >
                  ⚠️ {saveError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: '1.5rem', padding: '0.875rem' }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner spinner-sm" /> Saving...
                  </>
                ) : (
                  'Save & Continue →'
                )}
              </button>
            </form>
          )}

          {/* ---- STEP 2 — Face Registration ---- */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginBottom: '0.4rem',
                  color: 'var(--text-primary)',
                }}
              >
                Register Your Face
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Your face will be used to mark attendance automatically.
              </p>

              {/* Face scan illustration */}
              <div
                style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 2rem',
                  borderRadius: '50%',
                  border: `3px ${faceRegistered ? 'solid var(--accent-success)' : 'dashed rgba(99,102,241,0.5)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  background: faceRegistered
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(99,102,241,0.06)',
                  animation: faceRegistered ? 'none' : 'glow 2.5s infinite',
                }}
              >
                {faceRegistered ? '✅' : '🧑'}
              </div>

              {faceRegistered ? (
                <>
                  <div
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      color: 'var(--accent-success)',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Face registered successfully!
                  </div>
                  <button
                    className="btn btn-success btn-lg w-full"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Go to Dashboard →
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      color: 'var(--accent-warning)',
                      fontSize: '0.875rem',
                    }}
                  >
                    ⚠️ Face not yet registered. You won't be able to mark attendance until your face is enrolled.
                  </div>
                  <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={() => setIsFaceModalOpen(true)}
                  >
                    📷 Register Your Face
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: '0.75rem', width: '100%' }}
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Skip for now (attendance won't be available)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Face Upload Modal */}
      <FaceUploadModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccess={handleFaceSuccess}
      />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 35px rgba(99,102,241,0.5); border-color: rgba(99,102,241,0.8); }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;
