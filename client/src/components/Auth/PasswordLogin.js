// src/components/Auth/PasswordLogin.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PasswordLogin() {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: Connect to backend login API
    if (!userIdOrEmail || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    setErrorMsg('');
    console.log('Logging in...');
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
