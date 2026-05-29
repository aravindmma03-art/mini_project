import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LivenessModal from '../components/LivenessModal';
import SessionBadge from '../components/SessionBadge';

/* ---- SVG Progress Ring ---- */
const ProgressRing = ({ percentage, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 75
      ? '#10b981'
      : percentage >= 50
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="progress-ring-container">
      <div className="progress-ring-wrapper">
        <svg width={size} height={size}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        <div className="progress-ring-text">
          <div
            className="progress-ring-value"
            style={{ color }}
          >
            {percentage}%
          </div>
          <div className="progress-ring-label">Attendance</div>
        </div>
      </div>
    </div>
  );
};

/* ---- Format date ---- */
const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ---- Main Component ---- */
const StudentDashboard = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [isLivenessOpen, setIsLivenessOpen] = useState(false);

  // Derived stats from records
  const totalClasses = records.length;
  const presentCount = records.filter((r) => r.status?.toLowerCase() === 'present').length;
  const absentCount = totalClasses - presentCount;
  const attendancePercent =
    totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/students/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get('/api/attendance/records');
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load records', err);
    }
  }, []);

  const fetchActiveSession = useCallback(async () => {
    if (!profile) return;
    setSessionLoading(true);
    try {
      const params = new URLSearchParams({
        department: profile.department || '',
        year: profile.year || '',
        section: profile.section || '',
      });
      const res = await api.get(`/api/attendance/active-session?${params}`);
      setActiveSession(res.data || null);
    } catch {
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchRecords()]);
      setLoading(false);
    };
    init();
  }, [fetchProfile, fetchRecords]);

  useEffect(() => {
    if (profile) {
      fetchActiveSession();
      const interval = setInterval(fetchActiveSession, 30000);
      return () => clearInterval(interval);
    }
  }, [profile, fetchActiveSession]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <div>Loading your dashboard...</div>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'Student';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header-title">
          Welcome back, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="page-header-subtitle">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Low attendance warning */}
      {attendancePercent > 0 && attendancePercent < 75 && (
        <div className="warning-banner">
          <span className="warning-banner-icon">⚠️</span>
          <div className="warning-banner-text">
            Your attendance is <strong>{attendancePercent}%</strong>. Minimum required is 75%. Please attend more classes.
          </div>
        </div>
      )}

      {/* Active Session Panel */}
      {sessionLoading ? (
        <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1rem' }}>
          <div className="spinner spinner-sm" style={{ display: 'inline-block' }} />
          <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Checking for active sessions...
          </span>
        </div>
      ) : activeSession ? (
        <div className="live-session-card" style={{ marginBottom: '1.5rem' }}>
          <div className="live-session-info">
            <SessionBadge
              status="active"
              subject={activeSession.subject}
              department={activeSession.department}
              year={activeSession.year}
              section={activeSession.section}
              expiresAt={activeSession.expires_at || activeSession.end_time}
            />
          </div>
          <button
            className="btn btn-success"
            onClick={() => setIsLivenessOpen(true)}
          >
            📷 Mark Attendance
          </button>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📡</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active attendance session for your class right now.
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercent}%`}
          icon="📊"
          color={attendancePercent >= 75 ? 'success' : 'danger'}
          subtitle={`${presentCount} of ${totalClasses} classes`}
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon="📅"
          color="primary"
          subtitle="All recorded sessions"
        />
        <StatCard
          title="Present"
          value={presentCount}
          icon="✅"
          color="success"
          subtitle="Classes attended"
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon="❌"
          color="danger"
          subtitle="Classes missed"
        />
      </div>

      {/* Chart + Ring section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile card */}
        <div className="glass-card">
          <div className="section-header">
            <div className="section-title">My Profile</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              { label: 'Roll Number', value: profile?.roll_number || '—' },
              { label: 'Department', value: profile?.department || '—' },
              { label: 'Year', value: profile?.year ? `${profile.year} Year` : '—' },
              { label: 'Section', value: profile?.section ? `Section ${profile.section}` : '—' },
              { label: 'Email', value: profile?.email || user?.email || '—' },
              { label: 'Phone', value: profile?.phone || '—' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Ring */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 200,
          }}
        >
          <ProgressRing percentage={attendancePercent} size={160} />
          <div
            style={{
              marginTop: '1rem',
              textAlign: 'center',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background:
                attendancePercent >= 75
                  ? 'rgba(16,185,129,0.1)'
                  : 'rgba(239,68,68,0.1)',
              border: `1px solid ${attendancePercent >= 75 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: attendancePercent >= 75 ? 'var(--accent-success)' : 'var(--accent-danger)',
              }}
            >
              {attendancePercent >= 75 ? '✓ Safe Zone' : '⚠ Below Minimum'}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <div className="section-title">📋 Attendance History</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {records.length} records
          </span>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No attendance records yet</div>
            <div className="empty-state-text">
              Records will appear here after your first attendance session.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 30).map((record, i) => (
                  <tr key={record.id || i}>
                    <td className="td-primary">{formatDate(record.date || record.created_at)}</td>
                    <td>{record.subject || '—'}</td>
                    <td>{formatTime(record.time || record.created_at)}</td>
                    <td>
                      <span
                        className={`badge badge-${record.status?.toLowerCase() === 'present' ? 'present' : 'absent'}`}
                      >
                        {record.status?.toLowerCase() === 'present' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Liveness Modal */}
      <LivenessModal
        isOpen={isLivenessOpen}
        onClose={() => setIsLivenessOpen(false)}
        sessionId={activeSession?.id}
        onSuccess={() => {
          setIsLivenessOpen(false);
          fetchRecords();
        }}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
