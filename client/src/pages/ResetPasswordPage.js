import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);

  const [validations, setValidations] = useState({
    capital: false,
    special: false,
    number: false,
    length: false,
    match: false,
  });

  // Validate token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.post(`/api/auth/verify-token/${token}`);
      } catch (err) {
        setTokenExpired(true);
      }
    };
    verifyToken();
  }, [token]);

  useEffect(() => {
    const capital = /[A-Z]/.test(newPassword);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const number = /\d/.test(newPassword);
    const length = newPassword.length >= 8;
    const match = newPassword === confirmPassword && confirmPassword !== '';
    setValidations({ capital, special, number, length, match });
  }, [newPassword, confirmPassword]);

  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;

    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { newPassword });
      alert(res.data.message);
      navigate('/');
    } catch (err) {
      setErrorMsg('Reset Password Time Expired');
      setTokenExpired(true);
    }
  };

  const renderValidation = (condition, label) => (
    <div className="flex items-center space-x-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-400" />
      ) : (
        <FaTimesCircle className="text-red-400" />
      )}
      <span className={`${condition ? 'text-green-300' : 'text-red-300'}`}>{label}</span>
    </div>
  );

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

          {tokenExpired ? (
            <p className="text-center text-red-400 text-lg">Reset Password Time Expired</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="mt-4 space-y-1">
                {renderValidation(validations.capital, 'One uppercase character')}
                {renderValidation(validations.special, 'One special character')}
                {renderValidation(validations.number, 'One number')}
                {renderValidation(validations.length, 'At least 8 characters')}
                {renderValidation(validations.match, 'Passwords must match')}
              </div>

              {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}

              <button
                type="submit"
                disabled={!allValid}
                className={`w-full mt-4 ${
                  allValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed'
                } text-white font-semibold py-2 px-4 rounded transition-all duration-300`}
              >
                Reset Password
              </button>
            </form>
          )}

          <div className="flex text-sm mt-6">
            <Link to="/" className="text-indigo-400 hover:underline text-base font-medium tracking-wide">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
