import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../services/api';

/**
 * FaceUploadModal
 * Props: { isOpen, onClose, onSuccess }
 */

const WEBCAM_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const FaceUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('webcam');
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | capturing | validating | success | error
  const [message, setMessage] = useState('');
  const [camError, setCamError] = useState(false);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setUploadPreview(null);
    setStatus('idle');
    setMessage('');
    setCamError(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCapture = useCallback(() => {
    if (!webcamRef.current) return;
    const img = webcamRef.current.getScreenshot({ width: 640, height: 480 });
    if (img) {
      setCapturedImage(img);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File too large. Maximum size is 5MB.');
      setStatus('error');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target.result);
    reader.readAsDataURL(file);
    setStatus('idle');
    setMessage('');
  };

  const getImageToSubmit = () => {
    if (activeTab === 'webcam') return capturedImage;
    return uploadPreview;
  };

  const handleSubmit = async () => {
    const imageBase64 = getImageToSubmit();
    if (!imageBase64) return;

    setStatus('validating');
    setMessage('');

    try {
      const response = await api.post('/api/students/me/face', {
        imageBase64,
      });

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Face registered successfully!');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Face validation failed. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.message ||
          'Failed to register face. Please ensure your face is clearly visible and try again.'
      );
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  const previewImage = activeTab === 'webcam' ? capturedImage : uploadPreview;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">📷 Register Your Face</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Ensure good lighting and face the camera directly
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="result-state">
              <div className="result-icon success" style={{ animation: 'fadeIn 0.4s ease' }}>
                ✓
              </div>
              <div className="result-title success">Face Registered!</div>
              <div className="result-message">{message}</div>
              <button className="btn btn-success btn-lg" onClick={handleSuccess} style={{ marginTop: '0.5rem' }}>
                Complete Registration →
              </button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="result-state">
              <div className="result-icon error">✕</div>
              <div className="result-title error">Validation Failed</div>
              <div className="result-message">{message}</div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                  setCapturedImage(null);
                  setUploadPreview(null);
                  setUploadedFile(null);
                }}
                style={{ marginTop: '0.5rem' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* VALIDATING STATE */}
          {status === 'validating' && (
            <div className="loading-state">
              <div className="spinner spinner-lg" />
              <div style={{ fontWeight: 600 }}>Validating face...</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Our AI is processing your image
              </div>
            </div>
          )}

          {/* MAIN CONTENT (idle / capturing) */}
          {(status === 'idle' || status === 'capturing') && (
            <>
              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'webcam' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('webcam'); resetState(); }}
                >
                  📷 Use Webcam
                </button>
                <button
                  className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('upload'); resetState(); }}
                >
                  📁 Upload Photo
                </button>
              </div>

              {/* WEBCAM TAB */}
              {activeTab === 'webcam' && (
                <div>
                  {!capturedImage ? (
                    <>
                      {camError ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                          <div className="empty-state-icon">📵</div>
                          <div className="empty-state-title">Camera Unavailable</div>
                          <div className="empty-state-text">
                            Please allow camera access in your browser settings.
                          </div>
                        </div>
                      ) : (
                        <div className="webcam-container">
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
                        </div>
                      )}
                      {!camError && (
                        <button
                          className="btn btn-primary w-full"
                          style={{ marginTop: '1rem' }}
                          onClick={handleCapture}
                        >
                          📸 Capture Photo
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="image-preview">
                        <img src={capturedImage} alt="Captured face" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => setCapturedImage(null)}
                        >
                          Retake
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 2 }}
                          onClick={handleSubmit}
                        >
                          Submit for Validation
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* UPLOAD TAB */}
              {activeTab === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="face-file-input"
                  />

                  {!uploadPreview ? (
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '3rem 1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const mockEvent = { target: { files: [file] } };
                          handleFileChange(mockEvent);
                        }
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        Click to upload or drag & drop
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        JPEG, PNG, WebP — max 5MB
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="image-preview">
                        <img src={uploadPreview} alt="Uploaded face preview" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setUploadPreview(null);
                            setUploadedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          Change
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 2 }}
                          onClick={handleSubmit}
                        >
                          Submit for Validation
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceUploadModal;
