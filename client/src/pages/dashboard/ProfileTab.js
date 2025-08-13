// components/Profile/ProfileTab.jsx
import React from 'react';
import ProfileInfoForm from '../../components/Profile/ProfileInfoForm';
import PasswordChangeForm from '../../components/Profile/PasswordChangeForm';
//import FaceLockUpdate from '../../components/Profile/FaceLockUpdate';

const ProfileTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <ProfileInfoForm />
      <PasswordChangeForm />
      {/* <FaceLockUpdate /> */}
    </div>
  );
};

export default ProfileTab;
