// components/Header.jsx
import React from 'react';
import { FaMoon, FaSun, FaPalette} from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme, changeTheme } = React.useContext(ThemeContext);
  const userName = user.name || 'Guest';

  return (
  <header
  className={`flex justify-between items-center px-6 py-4 border-b shadow-sm transition-all duration-300
    ${
      theme === 'dark'
        ? 'bg-[#1f1f1f] border-white/10'
        : theme === 'light'
        ? 'bg-white text-gray-800 border-gray-200'
        : 'bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-gray-800 border-purple-300'
    }`}
>
      <h1 className="text-xl font-bold text-indigo-400">{userName}'s Dashboard</h1>
      <div className="flex space-x-4">
  <button
    title="Dark Theme"
    onClick={() => changeTheme('dark')}
    className={`w-10 h-10 text-xl rounded-full flex items-center justify-center text-white bg-black shadow transition ${
      theme === 'dark' ? 'ring-2 ring-white' : ''
    }`}
  >
    <FaMoon />
  </button>
  <button
    title="Light Theme"
    onClick={() => changeTheme('light')}
    className={`w-10 h-10 text-xl rounded-full flex items-center justify-center text-yellow-500 bg-white shadow transition ${
      theme === 'light' ? 'ring-2 ring-yellow-600' : ''
    }`}
  >
    <FaSun />
  </button>
  <button
    title="Colorful Theme"
    onClick={() => changeTheme('colorful')}
    className={`w-10 h-10 text-xl rounded-full flex items-center justify-center shadow transition
      bg-gradient-to-br from-purple-500 via-indigo-400 to-pink-400
      ${theme === 'colorful' ? 'ring-2 ring-purple-300' : ''}`}
  >
    <FaPalette />
  </button>
</div>
    </header>
  );
};
export default Header;
