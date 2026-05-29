import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/mentor/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.roll_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: students.length,
    registered: students.filter(s => s.face_registered).length,
    completed: students.filter(s => s.profile_complete).length
  };

  return (
    <div className="p-4" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary m-0">My Students</h2>
        <div style={{ width: '300px' }}>
          <input
            type="text"
            className="input-field w-100"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '50px' }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-3 d-flex align-items-center border-glow">
            <div className="me-3 fs-1">👥</div>
            <div>
              <h3 className="mb-0 text-white">{stats.total}</h3>
              <div className="text-muted small">Total Enrolled</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3 d-flex align-items-center" style={{ borderColor: 'var(--accent-success)' }}>
            <div className="me-3 fs-1">📋</div>
            <div>
              <h3 className="mb-0 text-success">{stats.completed}</h3>
              <div className="text-muted small">Profiles Completed</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3 d-flex align-items-center" style={{ borderColor: 'var(--accent-primary)' }}>
            <div className="me-3 fs-1">📷</div>
            <div>
              <h3 className="mb-0 text-primary">{stats.registered}</h3>
              <div className="text-muted small">Faces Registered</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-5 text-center">
          <div className="spinner spinner-lg mb-3"></div>
          <div>Loading students data...</div>
        </div>
      ) : (
        <div className="glass-card">
          <div className="section-header mb-3">
            <div className="section-title">Students Directory</div>
            <span className="text-muted small">{filtered.length} found</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Class (Dept/Yr/Sec)</th>
                  <th>Profile Status</th>
                  <th>Face Registration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted p-4">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white bg-primary bg-gradient me-3"
                            style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}
                          >
                            {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="fw-bold text-white">{student.name || 'Pending Name'}</div>
                            <div className="small text-muted">{student.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold text-light">{student.roll_number || '—'}</td>
                      <td>
                        {student.department ? (
                          <span className="badge badge-outline">
                            {student.department} / {student.year} / {student.section || 'N/A'}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {student.profile_complete ? (
                          <span className="badge badge-present">✓ Complete</span>
                        ) : (
                          <span className="badge badge-absent">✗ Incomplete</span>
                        )}
                      </td>
                      <td>
                        {student.face_registered ? (
                          <span className="badge bg-primary text-white border border-primary">✓ Registered</span>
                        ) : (
                          <span className="badge badge-absent">✗ Missing</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/mentor/attendance?student_id=${student.id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          Records
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .badge-outline { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); }
      `}</style>
    </div>
  );
}

export default MentorStudents;
