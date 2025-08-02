import React from 'react';
import LoginTabs from '../components/Auth/LoginTabs';

const LoginPage = () => {
  return (
    <div className="flex h-screen">
      {/* Left side */}
      <div className="w-1/2 bg-gradient-to-br from-purple-900 via-indigo-800 to-gray-900 text-white flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-4">iERP</h1>
        <p className="text-xl">Smart system for college automation</p>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-gray-100 flex justify-center items-center">
        <LoginTabs />
      </div>
    </div>
  );
};

export default LoginPage;
