import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaUpload, FaSave, FaCamera, FaLock } from 'react-icons/fa';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [name, setName] = useState(user.name);
  const [userId] = useState(user.userId);
  const [role] = useState(user.role);
  const [profileImage, setProfileImage] = useState(user.profileImage || '/uploads/default.png');
  const [imagePreview, setImagePreview] = useState(null);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Face login
  const [showModal, setShowModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const webcamRef = useRef(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const mediaChunks = useRef([]);

  useEffect(() => {
    if (newPassword !== confirmPassword && confirmPassword !== '') {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [newPassword, confirmPassword]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfileImage = async () => {
    // Upload image to backend here
    alert('Profile image saved!');
    localStorage.setItem(
      'user',
      JSON.stringify({ ...user, profileImage: imagePreview })
    );
    setProfileImage(imagePreview);
    setImagePreview(null);
  };

  const handleChangePassword = async () => {
    if (passwordError || !oldPassword || !newPassword) {
      alert('Fix password issues');
      return;
    }
    // Send old and new password to backend for update
    alert('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const startRecording = async () => {
    const stream = webcamRef.current.stream;
    const options = { mimeType: 'video/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaChunks.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        mediaChunks.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(mediaChunks.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setCapturedVideo(videoURL);
      setRecording(false);
    };

    mediaRecorder.start();
    setRecorder(mediaRecorder);
    setRecording(true);

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // 5 sec
  };

  const handleFaceSave = async () => {
    const password = prompt('Enter your password to confirm');
    if (!password) return;
    // Send video blob + password to backend for face embedding update
    alert('Face updated successfully!');
    setShowModal(false);
  };

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

      {/* Basic Info */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Role:</strong> {role}</p>
      </div>

      {/* Profile Image Update */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="text-lg mb-2 font-semibold">Update Profile Image</h3>
        <img
          src={imagePreview || profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-2"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <button
            onClick={handleSaveProfileImage}
            className="bg-blue-600 px-3 py-1 rounded mt-2 flex items-center gap-2"
          >
            <FaSave /> Save Image
          </button>
        )}
      </div>

      {/* Password Update */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="text-lg mb-2 font-semibold">Update Password</h3>
        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          {passwordError && <p className="text-red-400">{passwordError}</p>}
          <button
            onClick={handleChangePassword}
            className="bg-green-600 px-3 py-1 rounded flex items-center gap-2 mt-2"
          >
            <FaLock /> Update Password
          </button>
        </div>
      </div>

      {/* Face Login Update */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="text-lg mb-2 font-semibold">Update Face Lock</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 px-3 py-1 rounded flex items-center gap-2"
        >
          <FaCamera /> Record New Face
        </button>
      </div>

      {/* Modal for Face Recording */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded shadow-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">Record Your Face Movement</h2>
            {capturedVideo ? (
              <>
                <video src={capturedVideo} controls className="mb-4 w-full" />
                <button
                  onClick={handleFaceSave}
                  className="bg-blue-600 px-4 py-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setCapturedVideo(null);
                    setRecording(false);
                  }}
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Retake
                </button>
              </>
            ) : (
              <>
                <Webcam ref={webcamRef} className="w-full rounded mb-4" />
                <button
                  onClick={startRecording}
                  className="bg-green-600 px-4 py-2 rounded"
                  disabled={recording}
                >
                  {recording ? 'Recording...' : 'Start Recording'}
                </button>
              </>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-gray-400 mt-4 block underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
