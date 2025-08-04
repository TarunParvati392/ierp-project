// components/Header.jsx
import React from 'react';

const Header = () => {
  const userName = 'నా Dashboard నా ఇష్టం'; // TEMP: Replace with dynamic value

  return (
    <header className="bg-[#1f1f1f] px-6 py-4 border-b border-white/10 shadow-sm">
      <h1 className="text-xl font-bold text-indigo-400">{userName}</h1>
    </header>
  );
};

export default Header;
