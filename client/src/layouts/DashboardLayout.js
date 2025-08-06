// layouts/DashboardLayout.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

const DashboardLayout = () => {
  const { theme, themes } = useContext(ThemeContext);
  const navigate = useNavigate();
  const styles = getThemeStyles(theme);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className={`min-h-screen flex ${themes[theme].themeClass} transition-all duration-300`}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className={`p-6 overflow-y-auto flex-1 transition-all duration-300 ${styles.card}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
