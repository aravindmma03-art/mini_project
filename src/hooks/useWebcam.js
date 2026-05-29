import { useRef, useCallback } from 'react';

/**
 * useWebcam — custom hook for react-webcam logic
 * Returns: { webcamRef, captureImage, hasPermission, requestPermission }
 */
const useWebcam = () => {
  const webcamRef = useRef(null);

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;
    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 640,
        height: 480,
      });
      return imageSrc; // base64 jpeg string
    } catch (err) {
      console.error('Failed to capture image:', err);
      return null;
    }
  }, []);

  return {
    webcamRef,
    captureImage,
  };
};

export default useWebcam;
