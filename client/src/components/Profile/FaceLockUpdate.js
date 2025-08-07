// components/Profile/FaceLockUpdate.jsx
import React, { useRef, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';


const FaceLockUpdate = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);
    
  const videoRef = useRef(null);
  const [previewStarted, setPreviewStarted] = useState(false);

  const startWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setPreviewStarted(true);
      })
      .catch(() => {
        alert('Camera access denied or not found.');
      });
  };

  const handleUpdateFace = () => {
    // Backend call later to save new face
    alert('Face updated successfully.');
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Update Face Lock</h3>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <video
          ref={videoRef}
          autoPlay
          className="w-64 h-48 rounded border border-gray-300 dark:border-gray-700"
        />
        <button
          onClick={startWebcam}
          className={`${Styles.button} mb-4 md:mb-0`}
        >
          Start Webcam
        </button>
        <button
          onClick={handleUpdateFace}
          className={`${Styles.button} mb-4 md:mb-0`}
          disabled={!previewStarted}
        >
          Update Face Lock
        </button>
      </div>
    </div>
  );
};

export default FaceLockUpdate;
