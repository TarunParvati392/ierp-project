import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const PasswordLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { identifier, password });
            const {token,user} = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log(`✅ ${res.data.message}`);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.error) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Something went wrong');
            }
        } finally {
            setLoading(false);
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
                disabled={loading}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={loading}
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
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Loading...
                    </span>
                ) : (
                    'Login'
                )}
            </button>
        </form>
    );
};

export default PasswordLogin;
