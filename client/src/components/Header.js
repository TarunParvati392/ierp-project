// components/Header.jsx
import React, { useContext } from 'react';
import { FaMoon, FaSun, FaPalette } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme, themes, changeTheme } = useContext(ThemeContext);
  const styles = getThemeStyles(theme);
  const userName = user.name || 'Guest';

  return (
    <header className={`flex justify-between items-center px-6 py-4 shadow-sm transition-all duration-300 ${themes[theme].headerClass}`}>
      <h1 className={`text-xl font-bold tracking-wide ${styles.headerText}`}>
        {userName}'s Dashboard
      </h1>
      <div className="flex space-x-4">
        <button
          title="Dark Theme"
          onClick={() => changeTheme('dark')}
          className={`w-10 h-10 text-xl rounded-full flex items-center justify-center bg-black text-white shadow ${
            theme === 'dark' ? 'ring-2 ring-white' : ''
          }`}
        >
          <FaMoon />
        </button>
        <button
          title="Light Theme"
          onClick={() => changeTheme('light')}
          className={`w-10 h-10 text-xl rounded-full flex items-center justify-center bg-white text-yellow-600 shadow ${
            theme === 'light' ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          <FaSun />
        </button>
        <button
          title="Colorful Theme"
          onClick={() => changeTheme('colorful')}
          className={`w-10 h-10 text-xl rounded-full flex items-center justify-center shadow bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 ${
            theme === 'colorful' ? 'ring-2 ring-white' : ''
          }`}
        >
          <FaPalette />
        </button>
      </div>
    </header>
  );
};

export default Header;
