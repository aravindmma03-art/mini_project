import { useState, useEffect } from 'react';
import api from '../services/api';

function UnknownFaces() {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnknownFaces();
  }, []);

  const fetchUnknownFaces = async () => {
    try {
      const res = await api.get('/api/mentor/unknown-faces');
      setFaces(res.data);
    } catch (err) {
      console.error('Failed to load unknown faces');
    } finally {
      setLoading(false);
    }
  };

  const API_BASE = 'http://localhost:5000';

  return (
    <div className="p-4">
      <div className="page-header mb-4">
        <h2 className="text-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Unknown Faces Log
        </h2>
        <p className="text-muted">Unrecognized faces captured during your live attendance sessions.</p>
      </div>

      {loading ? (
        <div className="text-center p-5">Loading logs...</div>
      ) : faces.length === 0 ? (
        <div className="glass-card text-center p-5 text-muted">
          <i className="bi bi-shield-check display-1 mb-3 text-success opacity-50"></i>
          <h4 className="text-white">All clear!</h4>
          <p>No unknown faces have been detected in your sessions.</p>
        </div>
      ) : (
        <div className="row g-4">
          {faces.map(face => (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={face.id}>
              <div className="glass-card overflow-hidden h-100 d-flex flex-column border-glow" style={{borderColor: 'var(--accent-warning)'}}>
                <div style={{height: '250px', background: '#000'}}>
                  <img 
                    src={`${API_BASE}${face.image_path}`} 
                    alt="Unknown Face" 
                    style={{width: '100%', height: '100%', objectFit: 'contain'}}
                  />
                </div>
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <div className="mb-2">
                    <span className="badge bg-secondary mb-1">Session #{face.session_id}</span>
                  </div>
                  <div className="text-muted small mb-3">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(face.detected_time).toLocaleString()}
                  </div>
                  <div className="mt-auto d-flex gap-2">
                     <button className="btn btn-sm btn-outline-success flex-grow-1">Mark Known</button>
                     <button className="btn btn-sm btn-outline-danger flex-grow-1">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UnknownFaces;
