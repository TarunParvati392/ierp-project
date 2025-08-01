import { useState, useRef, useEffect } from 'react';

export default function FaceLogin() {
  const [error, setError] = useState('');
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const videoRef = useRef(null);

  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAllowed(true);

      // Attach the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError('Camera access denied or unavailable.');
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {!cameraAllowed && (
        <button
          className="bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800"
          onClick={handleFaceLogin}
        >
          Activate Camera for Face Login
        </button>
      )}

      {cameraAllowed && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-md border w-full max-w-md"
        />
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
