import React, { useState, useContext, useRef } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const ProfileInfoForm = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // ref to reset file input

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPG and PNG Files are Accepted');
        fileInputRef.current.value = ''; // clear input
        setProfileImage(null);
        return;
      }
      if (file.size > 300 * 1024) {
        alert('File size should not exceed 300 KB');
        fileInputRef.current.value = ''; // clear input
        setProfileImage(null);
        return;
      }
      setProfileImage(file);
    }
  };

// In your Profile Info component (where you handle image upload)
const handleImageUpdate = async (formData) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/user/profile-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to update image');

    const data = await res.json();

    // Update localStorage user first
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.profileImage = data.profileImage; // backend returns updated path
    localStorage.setItem('user', JSON.stringify(storedUser));

    // Now reload so Sidebar + ThemeContext get updated user
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('Error updating profile image');
    fileInputRef.current.value = ''; // clear input
    setProfileImage(null);
  }
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
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Role</label>
          <input
            type="text"
            value={user.role}
            disabled
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            value={user.name}
            disabled
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-3 py-2 rounded border bg-gray-200 text-gray-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Profile Image</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            ref={fileInputRef} // attach ref
            className="w-full"
          />
        </div>
      </div>
      <button
  onClick={() => {
    if (!profileImage) {
      alert("Please select an image first");
      return;
    }
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    handleImageUpdate(formData);
  }}
  className={`${Styles.button} mt-4`}
  disabled={loading}
>
  {loading ? "Updating..." : "Update Profile"}
</button>

    </div>
  );
};

export default ProfileInfoForm;
