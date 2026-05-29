import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function AttendanceRecords() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  
  useEffect(() => {
    fetchRecords();
  }, [dateFilter, searchParams]);

  const fetchRecords = async () => {
    try {
      let url = '/api/attendance/records';
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (searchParams.get('student_id')) params.append('student_id', searchParams.get('student_id'));
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await api.get(url);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualOverride = async (id, newStatus) => {
    try {
      await api.put(`/api/mentor/attendance/${id}`, { status: newStatus });
      fetchRecords(); // refresh
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const downloadCSV = () => {
    window.location.href = `http://localhost:5000/api/attendance/export/csv?token=${localStorage.getItem('token')}${dateFilter ? '&date='+dateFilter : ''}`;
  };

  const downloadExcel = () => {
    window.location.href = `http://localhost:5000/api/attendance/export/excel?token=${localStorage.getItem('token')}${dateFilter ? '&date='+dateFilter : ''}`;
  };

  return (
    <div className="p-4">
      <div className="page-header mb-4">
        <h2 className="text-primary">{user.role === 'mentor' ? 'Attendance Records' : 'My Attendance History'}</h2>
        
        {user.role === 'mentor' && (
          <div className="d-flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={downloadCSV}>
              <i className="bi bi-filetype-csv me-1"></i> CSV
            </button>
            <button className="btn btn-success btn-sm" onClick={downloadExcel}>
              <i className="bi bi-file-spreadsheet me-1"></i> Excel
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="mb-4 d-flex align-items-center gap-3">
           <label className="text-muted mb-0">Filter by Date:</label>
           <input 
             type="date" 
             className="input-field" 
             value={dateFilter} 
             onChange={e => setDateFilter(e.target.value)} 
           />
           {dateFilter && (
             <button className="btn btn-sm btn-outline-danger" onClick={() => setDateFilter('')}>Clear</button>
           )}
        </div>

        {loading ? (
          <div className="text-center p-4">Loading records...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {user.role === 'mentor' && <th>Student</th>}
                  {user.role === 'mentor' && <th>Roll No</th>}
                  {user.role === 'mentor' && <th>Class</th>}
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Verified</th>
                  <th>Status</th>
                  {user.role === 'mentor' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="9" className="text-center p-4">No records found.</td></tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id}>
                      {user.role === 'mentor' && <td className="fw-bold">{record.Student?.name || 'Unknown'}</td>}
                      {user.role === 'mentor' && <td>{record.Student?.roll_number}</td>}
                      {user.role === 'mentor' && <td>{record.Student?.department}-{record.Student?.year} ({record.Student?.section})</td>}
                      
                      <td>{record.subject}</td>
                      <td>{record.attendance_date}</td>
                      <td>{record.attendance_time}</td>
                      <td>
                        {record.liveness_verified ? (
                          <span className="text-success"><i className="bi bi-shield-check me-1"></i> AI Confirmed</span>
                        ) : (
                          <span className="text-muted">Manual</span>
                        )}
                        {record.confidence_score && (
                          <div className="small text-muted text-opacity-50 mt-1">{(record.confidence_score * 100).toFixed(1)}% match</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'danger' : 'warning'}`}>
                          {record.status}
                        </span>
                      </td>
                      {user.role === 'mentor' && (
                        <td>
                          <select 
                            className="input-field py-1 px-2 text-sm"
                            value={record.status}
                            onChange={(e) => handleManualOverride(record.id, e.target.value)}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Excused">Excused</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceRecords;
