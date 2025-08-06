// context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getRandomGradient } from '../utils/gradientUtils';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [theme, setTheme] = useState(user.theme || 'dark');
  const [colorfulGradient, setColorfulGradient] = useState(getRandomGradient());

  useEffect(() => {
    setTheme(user?.theme || 'dark');

    if (user?.theme === 'colorful') {
      setColorfulGradient(getRandomGradient());
    }
  }, [user?.theme]);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'colorful') {
      setColorfulGradient(getRandomGradient());
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/theme`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (res.ok) {
        user.theme = newTheme;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  const themes = {
    dark: {
      themeClass: 'bg-[#121212] text-white',
      sidebarClass: 'bg-[#1f1f1f] text-white',
      headerClass: 'bg-[#1f1f1f] text-white border-white/10',
    },
    light: {
      themeClass: 'bg-gray-100 text-gray-800',
      sidebarClass: 'bg-white text-gray-800 shadow-md',
      headerClass: 'bg-white text-gray-800 border-b border-gray-200',
    },
    colorful: {
      themeClass: `bg-gradient-to-br ${colorfulGradient} text-white`,
      sidebarClass: `bg-gradient-to-b ${colorfulGradient} text-white`,
      headerClass: `bg-gradient-to-r ${colorfulGradient} text-white`,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
