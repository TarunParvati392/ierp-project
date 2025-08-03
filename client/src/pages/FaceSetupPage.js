import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import api from '../utils/api';

const FaceSetupPage = () => {
  const webcamRef = useRef();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Load face-api.js models
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
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

    if (!detections) {
      setStatus("Face not detected. Try again.");
      return;
    }

    const embedding = Array.from(detections.descriptor);
    try {
      await api.post('/auth/save-face', {
        userId: 'admin001', // for testing
        facelock: embedding,
      });
      setStatus("Face saved successfully!");
    } catch (err) {
      setStatus("Error saving face data.");
    }
  };

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold mb-4">Face Setup (Admin)</h1>
      {loading ? (
        <p>Loading models...</p>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={350}
            height={300}
            className="rounded shadow"
          />
          <div className="mt-4">
            <button
              onClick={captureAndSave}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white"
            >
              Save Face
            </button>
          </div>
          <p className="mt-4">{status}</p>
        </>
      )}
    </div>
  );
};

export default FaceSetupPage;
