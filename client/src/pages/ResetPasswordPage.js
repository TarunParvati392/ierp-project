import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isValidPassword = (pass) =>
    /^[A-Z][\w@#$%^&+=]{4,}$/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[^a-zA-Z0-9]/.test(pass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (!isValidPassword(newPassword)) {
      setErrorMsg('Password must start with capital letter, include number & special char, and be 5+ characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { newPassword });
      setMessage(res.data.message);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Link expired or invalid');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">
        <div>
          <h1 className="text-7xl md:text-8xl font-extrabold text-indigo-400 leading-tight drop-shadow-2xl">
            iERP
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mt-6 font-light tracking-wider">
            Smart System for College Automation
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-6 text-indigo-400">Reset Password</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500"
              required
            />
            {message && <p className="text-green-400 text-sm">{message}</p>}
            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
            >
              Reset Password
            </button>
          </form>
          <div className="text-sm mt-4 text-right">
            <Link to="/" className="text-indigo-400 hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
