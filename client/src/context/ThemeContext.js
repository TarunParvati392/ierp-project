// context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getRandomGradient } from '../utils/gradientUtils';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.theme || 'dark';
  });

  const [colorfulGradient, setColorfulGradient] = useState(getRandomGradient());

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userTheme = currentUser.theme || 'dark';
    setTheme(userTheme);

    if (userTheme === 'colorful') {
      setColorfulGradient(getRandomGradient());
    }
  }, []);

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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.theme = newTheme;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  const themes = {
    dark: {
      themeClass: 'bg-[#121212] text-white transition-theme',
      sidebarClass: 'bg-[#1f1f1f] text-white transition-theme',
      headerClass: 'bg-[#1f1f1f] text-white border-white/10 transition-theme',
    },
    light: {
      themeClass: 'bg-gray-100 text-gray-800 transition-theme',
      sidebarClass: 'bg-white text-gray-800 shadow-md transition-theme',
      headerClass: 'bg-white text-gray-800 border-b border-gray-200 transition-theme',
    },
    colorful: {
      themeClass: `bg-gradient-to-br ${colorfulGradient} text-white transition-theme`,
      sidebarClass: `bg-gradient-to-b ${colorfulGradient} text-white transition-theme`,
      headerClass: `bg-gradient-to-r ${colorfulGradient} text-white transition-theme`,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
