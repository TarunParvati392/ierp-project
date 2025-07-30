import { useState } from 'react';

export default function FaceLogin() {
  const [error, setError] = useState('');
  const [cameraAllowed, setCameraAllowed] = useState(false);

  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAllowed(true);

      // TODO: Add face detection logic later
    } catch (err) {
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
          autoPlay
          playsInline
          className="rounded-md border w-full max-w-md"
          id="webcam"
        />
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
