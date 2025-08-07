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
    <div className={`h-screen flex ${themes[theme].themeClass} transition-all duration-300 overflow-hidden`}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${styles.card}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
