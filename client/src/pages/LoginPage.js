import React from 'react';
import LoginTabs from '../components/Auth/LoginTabs';

const LoginPage = () => {
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

      {/* Right Side Login Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-10">
          <LoginTabs />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
