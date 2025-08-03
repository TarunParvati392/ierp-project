import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import api from '../utils/api';

const FaceSetupPage = () => {
  const webcamRef = useRef();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      setLoading(false);
    };
    loadModels();
  }, []);

  const captureAndSave = async () => {
    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ Face not detected. Try again.");
      return;
    }

    const embedding = Array.from(detection.descriptor);

    try {
      const res = await api.post('/auth/save-face', {
        userId: 'admin001', // Only admin for now
        facelock: embedding,
      });
      setStatus('✅ Face saved successfully!');
    } catch (err) {
      setStatus('❌ Error saving face data.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Face Setup - Admin</h1>
      {loading ? (
        <p>Loading face recognition models...</p>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={280}
            className="rounded shadow-lg"
          />
          <button
            onClick={captureAndSave}
            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold transition"
          >
            Capture and Save Face
          </button>
          <p className="mt-4">{status}</p>
        </>
      )}
    </div>
  );
};

export default FaceSetupPage;

