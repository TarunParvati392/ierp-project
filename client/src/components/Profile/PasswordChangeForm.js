// components/Profile/PasswordChangeForm.jsx

import React, { useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PasswordChangeForm = () => {
  const { theme } = React.useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const validations = {
    uppercase: /[A-Z]/.test(newPass),
    special: /[!@#$%^&*]/.test(newPass),
    number: /\d/.test(newPass),
    length: newPass.length >= 8,
    match: newPass === confirm,
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.put('/user/update-password', {
        currentPassword: current,
        newPassword: newPass,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message || 'Password updated successfully');
      setCurrent('');
      setNewPass('');
      setConfirm('');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
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
          onCopy={e => { e.preventDefault(); toast.info('Copying password is not allowed.'); }}
          onPaste={e => { e.preventDefault(); toast.info('Pasting password is not allowed.'); }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-white text-black"
          onCopy={e => { e.preventDefault(); toast.info('Copying password is not allowed.'); }}
          onPaste={e => { e.preventDefault(); toast.info('Pasting password is not allowed.'); }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-white text-black"
          onCopy={e => { e.preventDefault(); toast.info('Copying password is not allowed.'); }}
          onPaste={e => { e.preventDefault(); toast.info('Pasting password is not allowed.'); }}
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
        disabled={!allValid || loading}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
};

export default PasswordChangeForm;
