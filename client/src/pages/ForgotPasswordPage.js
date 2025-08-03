import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    try {
      const res = await api.post('/api/auth/forgot-password', { identifier });
      setMessage(res.data.message);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Left Side Title */}
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

      {/* Right Side Forgot Password Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-6 text-indigo-400">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Enter User ID or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            {message && <p className="text-green-400 text-sm">{message}</p>}
            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300"
            >
              Send Reset Link
            </button>
          </form>

          <div className="flex text-sm mt-6">
            <Link to="/" className="text-indigo-400 hover:underline text-base font-medium tracking-wide">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
