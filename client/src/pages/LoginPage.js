// src/pages/LoginPage.jsx
import { useState } from 'react';
import PasswordLogin from '../components/Auth/PasswordLogin';
import FaceLogin from '../components/Auth/FaceLogin';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="flex w-[90%] max-w-6xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Side */}
        <div className="w-1/2 p-10 hidden md:flex flex-col justify-center bg-black/40">
          <h1 className="text-6xl font-bold text-white">iERP</h1>
          <p className="text-xl mt-4 text-purple-300">Smart System For College Automation</p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-white text-gray-900 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 px-4 font-semibold border-b-2 ${activeTab === 'password' ? 'border-purple-600 text-purple-700' : 'border-gray-300'}`}
              onClick={() => setActiveTab('password')}
            >
              Password Login
            </button>
            <button
              className={`flex-1 py-2 px-4 font-semibold border-b-2 ${activeTab === 'face' ? 'border-purple-600 text-purple-700' : 'border-gray-300'}`}
              onClick={() => setActiveTab('face')}
            >
              Face Login
            </button>
          </div>

          {activeTab === 'password' ? <PasswordLogin /> : <FaceLogin />}
        </div>
      </div>
    </div>
  );
}
