// components/Profile/ProfileInfoForm.jsx
import React, { useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const ProfileInfoForm = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [profileImage, setProfileImage] = useState(null);

  const handleUpdate = () => {
    // Backend update logic will be added later
    alert('Profile updated successfully.');
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Profile Info</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">User ID</label>
          <input
            type="text"
            value={user.userId}
            disabled
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Role</label>
          <input
            type="text"
            value={user.role}
            disabled
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div >
          <label className="block mb-1 text-sm font-medium">Profile Image</label>
          <input
            type="file"
            onChange={(e) => setProfileImage(e.target.files[0])}
            className="input"
          />
        </div>
      </div>
      <button onClick={handleUpdate} className={`${Styles.button} mt-4`}>
        Update Profile
      </button>
    </div>
  );
};

export default ProfileInfoForm;
