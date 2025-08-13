// src/pages/FaceLogin.jsx
function FaceLogin() {
    return ( 
<div className="flex flex-col items-center">
  <h1 className="text-4xl font-bold text-red-600">Work In Progress...</h1><br></br>
  <h1 className="text-4xl font-bold text-red-600">Coming Soon...</h1>

</div>
    );
}

export default FaceLogin;

{/*
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function FaceLogin() {
  const navigate = useNavigate();
  const videoRef = useRef();
  const [step, setStep] = useState(1);
  const [gestures, setGestures] = useState([]);
  const [currentGesture, setCurrentGesture] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const gestureEmbeddings = useRef([]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression'),
      ]);
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => (videoRef.current.srcObject = stream))
      .catch((err) => console.error("Camera error:", err));
  };

  const captureEmbedding = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();

    if (!detection) return null;
    return {
      descriptor: Array.from(detection.descriptor),
      expressions: detection.expressions,
    };
  };

  // Step 1 – Neutral face match
  const handleStartLogin = async () => {
    setLoading(true);
    const data = await captureEmbedding();
    if (!data) {
      setLoading(false);
      alert("No face detected, try again");
      return;
    }
    try {
      const res = await api.post("/facelock/face-login/start", {
        embedding: data.descriptor,
      });
      setGestures(res.data.gestures);
      setUserId(res.data.userId);
      setStep(2);
      setCurrentGesture(res.data.gestures[0]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Face not recognized");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – Perform each gesture
  const handleGestureCapture = async () => {
    const data = await captureEmbedding();
    if (!data) {
      alert("No face detected for gesture, try again");
      return;
    }

    // Optional: verify expression matches expected gesture
    if (currentGesture === "smile" && data.expressions.happy < 0.6) {
      alert("Please smile clearly");
      return;
    }
    if (currentGesture === "raise_eyebrows" && data.expressions.surprised < 0.6) {
      alert("Please raise your eyebrows more");
      return;
    }

    gestureEmbeddings.current.push({
      descriptor: data.descriptor,
      gesture: currentGesture,
    });

    const nextIndex = gestures.indexOf(currentGesture) + 1;
    if (nextIndex < gestures.length) {
      setCurrentGesture(gestures[nextIndex]);
    } else {
      handleVerifyLogin();
    }
  };

  // Step 3 – Verify with backend
  const handleVerifyLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/facelock/face-login-verify", {
        userId,
        embeddings: gestureEmbeddings.current,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Gesture verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 text-white">
      <video ref={videoRef} autoPlay muted width="320" height="280" className="rounded-md" />

      {step === 1 && (
        <button
          onClick={handleStartLogin}
          className="bg-blue-600 mt-4 px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Verifying Face..." : "Start Face Login"}
        </button>
      )}

      {step === 2 && (
        <div className="mt-4 flex flex-col items-center">
          <p className="mb-2 text-lg">Perform Gesture: <b>{currentGesture}</b></p>
          <button
            onClick={handleGestureCapture}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Capture Gesture
          </button>
        </div>
      )}
    </div>
  );
} } */}