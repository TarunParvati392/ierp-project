// src/components/Auth/PasswordLogin.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/api/axiosInstance';

export default function PasswordLogin() {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userIdOrEmail || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    try {
      const res = await axiosInstance.post('auth/login', {
        userIdOrEmail,
        password
      });

      const { token, user } = res.data;

      localStorage.setItem('iERP-token', token);
      localStorage.setItem('iERP-user', JSON.stringify(user));

      switch (user.role) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Faculty':
          navigate('/faculty/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please try again.");
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="User ID or Email"
        className="p-3 rounded border"
        value={userIdOrEmail}
        onChange={(e) => setUserIdOrEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-3 rounded border"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        className="bg-purple-700 text-white py-2 rounded hover:bg-purple-800"
      >
        Login
      </button>
      <div className="text-sm text-center mt-2">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</Link>
      </div>
    </form>
  );
}
