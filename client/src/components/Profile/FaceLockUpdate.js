// components/Profile/FaceLockUpdate.jsx
import React, { useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import api from "../../utils/api";
import * as faceapi from "face-api.js";

const FaceLockUpdate = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(user?.facelockUpdatedAt || null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition"),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  const startWebcam = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      setPreviewStarted(true);
    }).catch(() => {
      alert("Camera Access Denied or Not Found.");
    });
  };

  const stopWebcam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setPreviewStarted(false);
  };

  const captureFaceEmbedding = async () => {
    if (!modelsLoaded) {
      alert("Models not loaded yet. Please wait...");
      return null;
    }
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected. Please ensure your face is visible.");
      return null;
    }

    // Store as Float32 precision array
    return Array.from(detection.descriptor);
  };

  const handleUpdateFace = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const embedding = await captureFaceEmbedding();
      if (!embedding) return;

      const res = await api.post(
        "/facelock/update-facelock",
        { facelockEmbedding: embedding },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("FaceLock updated successfully");
        setLastUpdated(new Date());
      }
    } catch {
      alert("Failed to update FaceLock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Update Face Lock</h3>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Side: Video & Controls */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div>
            <video
              ref={videoRef}
              autoPlay
              className="w-64 h-48 rounded border border-gray-300 dark:border-gray-700"
            />
            <canvas
              ref={canvasRef}
              width="256"
              height="192"
              style={{ display: "none" }}
            ></canvas>
          </div>
          <div className="flex flex-col gap-2">
            {!previewStarted ? (
              <button onClick={startWebcam} className={Styles.button}>
                Start Webcam
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdateFace}
                  className={`${Styles.button} ${loading ? "opacity-50" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Capture & Update FaceLock"}
                </button>
                <button onClick={stopWebcam} className={`${Styles.button} bg-red-500`}>
                  Stop Webcam
                </button>
              </>
            )}
          </div>
        </div>

        <div className="text-red-500 space-y-2 md:w-1/3">
          <h4 className="font-bold">Rules For Best Capture:</h4>
          <ul className="list-disc pl-4">
            <li>Good Lighting.</li>
            <li>Face Centered in Frame.</li>
            <li>Neutral Expression.</li>
          </ul>
          {lastUpdated && (
            <p className="mt-2 text-green-500">
              Last Updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceLockUpdate;
