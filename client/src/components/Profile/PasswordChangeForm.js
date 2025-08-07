// components/Profile/PasswordChangeForm.jsx
import React, { useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';


const PasswordChangeForm = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const validations = {
    uppercase: /[A-Z]/.test(newPass),
    special: /[!@#$%^&*]/.test(newPass),
    number: /\d/.test(newPass),
    length: newPass.length >= 8,
    match: newPass === confirm,
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleChangePassword = () => {
    // Backend logic later
    alert('Password changed successfully.');
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Change Password</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="password"
          placeholder="Current Password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-white text-black"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-white text-black"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-white text-black"
        />
      </div>
      <ul className="text-sm space-y-1 mt-2">
        <li className={validations.uppercase ? 'text-green-500' : 'text-red-500'}>
          • One uppercase letter
        </li>
        <li className={validations.special ? 'text-green-500' : 'text-red-500'}>
          • One special character
        </li>
        <li className={validations.number ? 'text-green-500' : 'text-red-500'}>
          • One number
        </li>
        <li className={validations.length ? 'text-green-500' : 'text-red-500'}>
          • Minimum 8 characters
        </li>
        <li className={validations.match ? 'text-green-500' : 'text-red-500'}>
          • Passwords match
        </li>
      </ul>
      <button
        onClick={handleChangePassword}
        className={`${Styles.button} mt-4`}
        disabled={!allValid}
      >
        Update Password
      </button>
    </div>
  );
};

export default PasswordChangeForm;
