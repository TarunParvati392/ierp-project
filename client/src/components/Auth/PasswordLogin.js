import React, { useState } from 'react';
import api from '../../utils/api';

const PasswordLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await api.post('/api/auth/login', { identifier, password });
      console.log(`✅ ${res.data.message}`);
    } catch (err) {
      if (err.response?.data?.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('Something went wrong');
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="text"
        placeholder="User ID or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <div className="flex justify-between text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  );
};

export default PasswordLogin;
