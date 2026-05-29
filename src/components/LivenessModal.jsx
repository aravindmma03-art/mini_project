import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../services/api';

/**
 * LivenessModal — marks attendance via face recognition
 * Props: { isOpen, onClose, sessionId, onSuccess }
 * Steps: instructions → webcam → loading → result
 */

const WEBCAM_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const LivenessModal = ({ isOpen, onClose, sessionId, onSuccess }) => {
  const [step, setStep] = useState('instructions'); // instructions | webcam | loading | success | error
  const [resultMessage, setResultMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [camError, setCamError] = useState(false);

  const webcamRef = useRef(null);

  const reset = () => {
    setStep('instructions');
    setResultMessage('');
    setStudentInfo(null);
    setCamError(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageBase64 = webcamRef.current.getScreenshot({ width: 640, height: 480 });
    if (!imageBase64) return;

    setStep('loading');

    try {
      const response = await api.post('/api/attendance/mark', {
        imageBase64,
        session_id: sessionId,
      });

      setStudentInfo({
        name: response.data.studentName,
        subject: response.data.subject,
        time: response.data.time,
        message: response.data.message,
      });
      setStep('success');
    } catch (err) {
      setResultMessage(
        err.response?.data?.message ||
          'Face not recognized. Please ensure good lighting and face the camera directly.'
      );
      setStep('error');
    }
  }, [sessionId]);

  const handleSuccessClose = () => {
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-box" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {step === 'instructions' && '📋 Mark Attendance'}
            {step === 'webcam' && '📷 Face Verification'}
            {step === 'loading' && '🔍 Verifying...'}
            {step === 'success' && '✅ Marked Present'}
            {step === 'error' && '❌ Verification Failed'}
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* STEP 1 — Instructions */}
          {step === 'instructions' && (
            <div style={{ textAlign: 'center' }}>
              {/* Face position guide illustration */}
              <div
                style={{
                  width: 160,
                  height: 180,
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  border: '3px dashed var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  background: 'rgba(99,102,241,0.05)',
                  animation: 'glow 2s infinite',
                }}
              >
                🧑
              </div>

              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Get Ready to Mark Attendance
              </h3>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                {[
                  '🌟 Ensure good, even lighting on your face',
                  '📐 Position your face within the guide circle',
                  '👁️ Look straight at the camera',
                  '😐 Keep a neutral expression',
                  '🚫 Remove sunglasses or face coverings',
                ].map((tip) => (
                  <div
                    key={tip}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      padding: '0.4rem 0',
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                  >
                    {tip}
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={() => { setCamError(false); setStep('webcam'); }}
              >
                Open Camera →
              </button>
            </div>
          )}

          {/* STEP 2 — Webcam */}
          {step === 'webcam' && (
            <div>
              {camError ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📵</div>
                  <div className="empty-state-title">Camera Unavailable</div>
                  <div className="empty-state-text">Allow camera access and try again.</div>
                  <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={reset}>
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="webcam-container" style={{ marginBottom: '1rem' }}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      screenshotQuality={0.92}
                      videoConstraints={WEBCAM_CONSTRAINTS}
                      onUserMediaError={() => setCamError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="webcam-overlay">
                      <div className="face-guide" />
                    </div>
                    <div className="webcam-challenge">Look straight at the camera</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={reset} style={{ flex: 1 }}>
                      ← Back
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      onClick={handleCapture}
                    >
                      📸 Capture & Mark Present
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — Loading */}
          {step === 'loading' && (
            <div className="loading-state">
              <div className="spinner spinner-lg" />
              <div style={{ fontWeight: 600 }}>Verifying face...</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                AI is matching your face against registered photos
              </div>
            </div>
          )}

          {/* STEP 4 — Success */}
          {step === 'success' && (
            <div className="result-state">
              <div
                className="result-icon success"
                style={{
                  fontSize: '2.5rem',
                  animation: 'fadeIn 0.5s ease',
                }}
              >
                ✓
              </div>
              <div className="result-title success">Attendance Marked!</div>
              {studentInfo && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  {studentInfo.name && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Student: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{studentInfo.name}</strong>
                    </div>
                  )}
                  {studentInfo.subject && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Subject: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{studentInfo.subject}</strong>
                    </div>
                  )}
                  {studentInfo.time && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Time: </span>
                      <strong style={{ color: 'var(--accent-success)' }}>{studentInfo.time}</strong>
                    </div>
                  )}
                </div>
              )}
              <button
                className="btn btn-success"
                style={{ marginTop: '0.5rem' }}
                onClick={handleSuccessClose}
              >
                Done ✓
              </button>
            </div>
          )}

          {/* STEP 5 — Error */}
          {step === 'error' && (
            <div className="result-state">
              <div className="result-icon error">✕</div>
              <div className="result-title error">Verification Failed</div>
              <div className="result-message">{resultMessage}</div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setStep('webcam'); setResultMessage(''); }}
                >
                  Try Again
                </button>
                <button className="btn btn-ghost" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivenessModal;
