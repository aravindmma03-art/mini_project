import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import AttendanceChart from '../components/AttendanceChart';
import SessionBadge from '../components/SessionBadge';

function MentorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/mentor/dashboard');
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-center text-danger">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-4" style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Premium Header Banner */}
      <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 100%)', borderLeft: '4px solid var(--accent-primary)' }}>
        <div>
          <h2 className="text-white fw-bold mb-1">Welcome back, Mentor!</h2>
          <p className="text-muted mb-0">Here is your classroom overview for today.</p>
        </div>
        <div className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill fs-6 fw-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Students" value={data.totalStudents} icon="people" color="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Present Today" value={data.presentToday} icon="check-circle" color="success" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Absent Today" value={data.absentToday} icon="x-circle" color="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Active Sessions" value={data.activeSessions} icon="broadcast" color="warning" />
        </div>
      </div>

      {/* Main Content Two-Column Grid */}
      <div className="row g-4">
        {/* Left Column (Main Data) */}
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          
          {/* Trend Chart */}
          <div className="glass-card p-4">
            <h5 className="mb-4 text-white fw-semibold">7-Day Attendance Trend</h5>
            <div style={{ height: '300px' }}>
              <AttendanceChart
                title=""
                type="line"
                labels={data.dailyTrend.map(d => d.date)}
                values={data.dailyTrend.map(d => d.count)}
              />
            </div>
          </div>

          {/* Low Attendance Table */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="p-4 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <h5 className="mb-0 text-white fw-semibold d-flex align-items-center">
                <span className="text-warning me-2">⚠️</span> Needs Attention (&lt;75% Attendance)
              </h5>
            </div>
            
            {data.lowAttendanceStudents.length === 0 ? (
              <div className="text-center p-5">
                <div className="fs-1 mb-3">🌟</div>
                <h6 className="text-white">All Clear!</h6>
                <p className="text-muted mb-0">Every student is meeting the minimum attendance requirement.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-white" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-muted fw-normal border-0 border-bottom" style={{ borderColor: 'var(--border)' }}>Student Name</th>
                      <th className="px-4 py-3 text-muted fw-normal border-0 border-bottom" style={{ borderColor: 'var(--border)' }}>Roll No</th>
                      <th className="px-4 py-3 text-muted fw-normal border-0 border-bottom text-end" style={{ borderColor: 'var(--border)' }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowAttendanceStudents.map(student => (
                      <tr key={student.id}>
                        <td className="px-4 py-3 border-0 border-bottom" style={{ borderColor: 'var(--border)' }}>
                          <span className="fw-medium text-light">{student.name}</span>
                        </td>
                        <td className="px-4 py-3 border-0 border-bottom text-muted" style={{ borderColor: 'var(--border)' }}>
                          {student.roll_number}
                        </td>
                        <td className="px-4 py-3 border-0 border-bottom text-end" style={{ borderColor: 'var(--border)' }}>
                          <span className={`badge ${student.percentage < 50 ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill px-3`}>
                            {student.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side Widgets) */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          
          {/* Doughnut Chart */}
          <div className="glass-card p-4">
            <h5 className="mb-4 text-white fw-semibold">Today's Split</h5>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <AttendanceChart
                title=""
                type="doughnut"
                labels={['Present', 'Absent']}
                values={[data.presentToday, data.absentToday]}
              />
            </div>
          </div>

          {/* Unknown Face Alerts */}
          <div className="glass-card p-4 flex-grow-1 d-flex flex-column justify-content-center text-center" style={{ borderTop: '4px solid var(--accent-danger)' }}>
             <div 
                className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '64px', height: '64px', fontSize: '2rem' }}
             >
                <i className="bi bi-shield-exclamation"></i>
             </div>
             <h4 className="text-white mb-2 fw-semibold">Security Alerts</h4>
             <p className="text-muted mb-4 small">
               Review logs of unverified individuals who attempted to mark attendance today.
             </p>
             <Link to="/mentor/unknown-faces" className="btn btn-danger rounded-pill w-100">
               Review Logs
             </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .table-hover tbody tr:hover td { background-color: rgba(255,255,255,0.02) !important; color: white !important; }
      `}</style>
    </div>
  );
}

export default MentorDashboard;
