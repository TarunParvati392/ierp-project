// components/Profile/FaceLockUpdate.jsx
import React, { useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import api from "../../utils/api";

const FaceLockUpdate = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [previewStarted, setPreviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gestureMode, setGestureMode] = useState(false);
  const [gestureReady, setGestureReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(user?.facelockUpdatedAt || null);

  const startWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setPreviewStarted(true);
      })
      .catch(() => {
        alert("Camera access denied or not found.");
      });
  };

  const stopWebcam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setPreviewStarted(false);
    setGestureMode(false);
    setGestureReady(false);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const handleUpdateFace = async () => {
    setLoading(true);
    const imageData = captureImage();

    try {
      const res = await api.post("/user/update-facelock", {
        userId: user.userId,
        image: imageData
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Face Updated Successfully.");
        setLastUpdated(new Date());
      }
    } catch {
      alert("Failed to update Face Lock.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchFace = async () => {
    const imageData = captureImage();
    try {
      const res = await api.post("/user/match-face", {
        userId: user.userId,
        image: imageData
      });
      if (res.data.match) {
        alert("Face Matched");
        setGestureReady(true);
      } else {
        alert("Face Not Matched");
      }
    } catch {
      alert("Error checking face match.");
    }
  };

  const handleRecordGesture = async () => {
    if (!gestureReady) {
      alert("Match your face first before recording gesture.");
      return;
    }

    if (!window.confirm("After 3 Seconds Gesture Record Starts")) return;

    // Countdown overlay (optional: display numbers on video)
    await new Promise((res) => setTimeout(res, 3000));

    alert("Recording gesture for 5 seconds...");
    // Placeholder for recording logic
    // Detect idle face for 2 seconds → fail

    const gestureSuccess = true; // Replace with detection logic
    if (!gestureSuccess) {
      alert("Gesture Record failed as Face Idle for 2 secs continuously");
      return;
    }

    try {
      await api.post("/user/update-gesture", {
        userId: user.userId,
        gesture: "sample-gesture-data" // Replace with real gesture data
      });
      alert("Gesture recorded successfully.");
    } catch {
      alert("Failed to save gesture.");
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
        ) : !gestureMode ? (
          <>
            <button
              onClick={handleUpdateFace}
              className={`${Styles.button} ${loading ? "opacity-50" : ""}`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Capture & Update FaceLock"}
            </button>
            <button
              onClick={() => setGestureMode(true)}
              className={Styles.button}
            >
              Record & Update Gesture
            </button>
            <button onClick={stopWebcam} className={`${Styles.button} bg-red-500`}>
              Stop Webcam
            </button>
          </>
        ) : (
          <>
            <button onClick={handleMatchFace} className={Styles.button}>
              Match Face
            </button>
            <button
              onClick={handleRecordGesture}
              className={`${Styles.button} ${!gestureReady ? "opacity-50" : ""}`}
              disabled={!gestureReady}
            >
              Record Gesture
            </button>
            <button onClick={stopWebcam} className={`${Styles.button} bg-red-500`}>
              Stop Webcam
            </button>
          </>
        )}
        </div>
      </div>

      {/* Right Side: Rules */}
      <div className="text-red-500 text-sm space-y-2 mmd:w-1/3">
        <h4 className="font-bold">Rules:</h4>
        <ul className="list-disc pl-4">
          <li>Face Login requires both face and gesture match.</li>
          <li>Gesture recording is mandatory for face login.</li>
          <li>Gesture should be 5 seconds long and your face should not be idle.</li>
          <li>If face is idle for 2 seconds continuously → gesture recording fails.</li>
          <li>You must register a face and match the face before recording a gesture.</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default FaceLockUpdate;
