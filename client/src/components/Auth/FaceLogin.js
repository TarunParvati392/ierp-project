import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import api from '../../utils/api';

const FaceLogin = () => {
  const webcamRef = useRef();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      setLoading(false);
    };
    loadModels();
  }, []);

  const handleFaceLogin = async () => {
    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus('❌ Face not detected. Try again.');
      return;
    }

    const embedding = Array.from(detection.descriptor);

    try {
      const res = await api.post('/auth/face-login', { embedding });
      setStatus(`✅ ${res.data.message}`);
      console.log(`✅ ${res.data.message}`);
    } catch (err) {
      setStatus(err.response?.data?.error || '❌ Face login failed');
    }
  };

  return (
    <div className="text-white text-center">
      {loading ? (
        <p>Loading face models...</p>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            width={320}
            height={280}
            className="rounded shadow-lg mx-auto"
          />
          <button
            onClick={handleFaceLogin}
            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
          >
            Login with Face
          </button>
          <p className="mt-4">{status}</p>
        </>
      )}
    </div>
  );
};

export default FaceLogin;
