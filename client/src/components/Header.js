// components/Header.jsx
import React from 'react';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Guest';

  return (
    <header className="bg-[#1f1f1f] px-6 py-4 border-b border-white/10 shadow-sm">
      <h1 className="text-xl font-bold text-indigo-400">{userName}'s Dashboard</h1>
    </header>
  );
};

export default Header;
