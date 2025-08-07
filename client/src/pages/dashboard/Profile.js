import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Profile = () => {
  const { theme } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState('/uploads/default.png');

  // Dummy user data (replace with real login data later)
  const [userData, setUserData] = useState({
    name: 'Tarun Parvathi',
    userId: 'TARUN123',
    email: 'tarun@example.com',
    role: 'Admin',
  });

  // Profile Image Handler
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // frontend preview
        // TODO: Upload to backend
      };
      reader.readAsDataURL(file);
    }
  };

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validations, setValidations] = useState({
    uppercase: false,
    number: false,
    specialChar: false,
    minLength: false,
    match: false,
  });

  const validationTexts = {
    uppercase: 'At least 1 uppercase letter',
    number: 'At least 1 number',
    specialChar: 'At least 1 special character',
    minLength: 'Minimum 8 characters',
    match: 'New and confirm password must match',
  };

  // Validate on new password
  const handleNewPassword = (password) => {
    setNewPassword(password);
    setValidations({
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password),
      minLength: password.length >= 8,
      match: password === confirmPassword,
    });
  };

  // Live validation on confirm password
  useEffect(() => {
    setValidations((prev) => ({
      ...prev,
      match: newPassword === confirmPassword,
    }));
  }, [confirmPassword]);

  const isFormValid = () => {
    return Object.values(validations).every(Boolean) && oldPassword.length > 0;
  };

  const handlePasswordUpdate = () => {
    alert('Password updated (frontend only for now)');
    // TODO: Integrate backend API
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${theme.background} text-white`}>
      <div className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-opacity-50 p-6 rounded-lg shadow-lg ${theme.card}`}>
        
        {/* Profile Image + Upload */}
        <div className="flex flex-col items-center">
          <img
            src={profileImage}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <label className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
            Upload New Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
          </label>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={userData.name}
              readOnly
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">User ID</label>
            <input
              type="text"
              value={userData.userId}
              readOnly
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="text"
              value={userData.email}
              readOnly
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <input
              type="text"
              value={userData.role}
              readOnly
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className={`col-span-2 mt-10 bg-opacity-50 p-6 rounded-lg shadow-lg ${theme.card}`}>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => handleNewPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
        </div>

        {/* Live Validation Feedback */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(validations).map(([key, isValid]) => (
            <div key={key} className={`flex items-center gap-2 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
              <span>{isValid ? '✔️' : '❌'}</span>
              {validationTexts[key]}
            </div>
          ))}
        </div>

        <button
          onClick={handlePasswordUpdate}
          disabled={!isFormValid()}
          className={`mt-6 px-6 py-2 rounded text-white transition ${
            isFormValid() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
