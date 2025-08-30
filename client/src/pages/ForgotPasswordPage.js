import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      setMessage(res.data.message);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
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
              disabled={loading}
            />

            {message && <p className="text-green-400 text-sm">{message}</p>}
            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
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
