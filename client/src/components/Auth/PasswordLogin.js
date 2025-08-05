import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const PasswordLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const res = await api.post('/auth/login', { identifier, password });
            const {token,user} = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log(`✅ ${res.data.message}`);
            // You can navigate to dashboard once implemented:
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.error) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Something went wrong');
            }
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-5">
            <input
                type="text"
                placeholder="User ID or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
            />

            {errorMsg && (
                <p className="text-red-400 text-sm mt-1">{errorMsg}</p>
            )}

            <div className="flex text-sm mt-6">
                <a
                    href="/forgot-password"
                    className="text-indigo-400 hover:underline transition text-base font-medium tracking-wide"
                >
                    Forgot Password?
                </a>
            </div>

            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300 shadow-md hover:shadow-xl"
            >
                Login
            </button>
        </form>
    );
};

export default PasswordLogin;
