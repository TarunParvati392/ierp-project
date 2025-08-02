import React, { useState } from 'react';
import PasswordLogin from './PasswordLogin';

const LoginTabs = () => {
  const [tab, setTab] = useState('password');

  return (
    <div className="bg-white p-8 shadow-lg rounded-lg w-96">
      <div className="flex justify-around mb-4">
        <button
          className={`px-4 py-2 ${tab === 'password' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
          onClick={() => setTab('password')}
        >
          Password Login
        </button>
        <button
          className="px-4 py-2 text-gray-400 cursor-not-allowed"
          disabled
        >
          Face Login
        </button>
      </div>

      {tab === 'password' && <PasswordLogin />}
    </div>
  );
};

export default LoginTabs;
