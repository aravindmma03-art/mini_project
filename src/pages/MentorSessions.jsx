import { useState, useEffect } from 'react';
import api from '../services/api';
import SessionBadge from '../components/SessionBadge';

function MentorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    department: 'CSE',
    year: '1st',
    section: 'A',
    duration_minutes: 60
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/attendance/sessions');
      setSessions(res.data);
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/attendance/session/start', formData);
      setShowModal(false);
      fetchSessions();
      setFormData({ ...formData, subject: '' }); // reset
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting session');
    }
  };

  const handleCloseSession = async (id) => {
    if (!window.confirm('Are you sure you want to close this session early?')) return;
    try {
      await api.put(`/api/attendance/session/${id}/close`);
      fetchSessions();
    } catch (err) {
      alert('Error closing session');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Live Sessions</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> Start New Session
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Sessions List */}
      <div className="glass-card p-4">
        {loading ? (
          <div className="text-center p-4">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-5 text-muted">No sessions created yet.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td className="fw-bold">{s.subject}</td>
                    <td>{s.department} - {s.year} (Sec {s.section})</td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                    <td>
                      <SessionBadge 
                        status={s.status} 
                        expiresAt={s.expires_at} 
                      />
                    </td>
                    <td>
                      {s.status === 'Active' && new Date(s.expires_at) > new Date() && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCloseSession(s.id)}
                        >
                          Close Early
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Start Live Session</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleStartSession}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label>Subject Name</label>
                    <input 
                      type="text" 
                      className="input-field w-100" 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label>Department</label>
                      <select className="input-field w-100" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                        {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label>Year</label>
                      <select className="input-field w-100" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                        {['1st', '2nd', '3rd', '4th'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label>Section</label>
                      <select className="input-field w-100" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                        {['A', 'B', 'C', 'D'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label>Duration (mins)</label>
                      <select className="input-field w-100" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}>
                        {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} mins</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="alert alert-warning mb-0" style={{fontSize: '0.85rem'}}>
                    This will close any currently active session you have running.
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Start Session</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorSessions;
