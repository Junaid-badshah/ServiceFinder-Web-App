import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [facingMode, setFacingMode] = useState('user');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load Face Detection Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('Face models loaded successfully');
      } catch (err) {
        console.error('Error loading face models:', err);
      }
    };
    loadModels();
  }, []);
 // user = front, environment = back

  // ============================================
  // Start camera
  // ============================================
  const startCamera = async (mode) => {
    setLoading(true);
    setError('');

    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to open camera. Make sure camera is not in use by another app.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      // Cleanup — stop camera when unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // ============================================
  // Capture photo from video
  // ============================================
  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // ============================================
    // FACE DETECTION RESTRICTION
    // ============================================
    if (!modelsLoaded) {
      setError('Face detection model load ho raha hai. Thodi der wait karein...');
      return;
    }

    try {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();

      // Detect faces
      const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions()
      );

      // Agar koi face nahi mila
      if (detections.length === 0) {
        setError('Is picture mein koi chehra nahi hai! Sirf apna face capture karein.');
        return; // Upload rok dein
      }

      // Agar ek se zyada face hain
      if (detections.length > 1) {
        setError('Picture mein ek se zyada chehre hain! Sirf apni photo capture karein.');
        return; // Upload rok dein
      }

    } catch (err) {
      console.error('Face detection error:', err);
      setError('Face check karne mein error aaya. Dobara koshish karein.');
      return;
    }
    // ============================================

    // Stop camera before callback
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    onCapture(dataUrl);
  };

  // ============================================
  // Toggle front/back camera (mobile)
  // ============================================
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // ============================================
  // Cancel
  // ============================================
  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <h3 className="text-lg font-bold">📷 Take Photo</h3>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center text-white p-6 max-w-md">
            <p className="text-5xl mb-4">📷</p>
            <p className="text-lg font-semibold mb-2">Camera Issue</p>
            <p className="text-sm text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => startCamera(facingMode)}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="p-6 bg-black/80 flex items-center justify-center gap-8">
          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={loading}
            className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center border-4 border-gray-400 disabled:opacity-50 transition"
            title="Capture"
          >
            <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-400"></div>
          </button>

          {/* Toggle camera */}
          <button
            onClick={toggleCamera}
            disabled={loading}
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white disabled:opacity-50"
            title="Switch camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraCapture;
