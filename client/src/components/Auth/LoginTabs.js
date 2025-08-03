import React, { useState } from 'react';
import PasswordLogin from './PasswordLogin';
import FaceLogin from './FaceLogin';

const LoginTabs = () => {
  const [tab, setTab] = useState('password');

  return (
    <>
      <div className="flex justify-around mb-6">
        <button
          className={`px-4 py-2 rounded-t text-sm transition-all duration-200 ${
            tab === 'password'
              ? 'text-indigo-400 border-b-2 border-indigo-400 font-bold'
              : 'text-gray-400'
          }`}
          onClick={() => setTab('password')}
        >
          Password Login
        </button>
        <button
          className={`px-4 py-2 rounded-t text-sm transition-all duration-200 ${
            tab === 'face'
              ? 'text-indigo-400 border-b-2 border-indigo-400 font-bold'
              : 'text-gray-400'
          }`}
          onClick={() => setTab('face')}
        >
          Face Login
        </button>        
      </div>

      {tab === 'password' && <PasswordLogin />}
      {tab === 'face' && <FaceLogin />}
    </>
  );
};

export default LoginTabs;
