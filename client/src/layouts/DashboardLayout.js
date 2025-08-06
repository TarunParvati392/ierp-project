// layouts/DashboardLayout.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Outlet } from 'react-router-dom';


const DashboardLayout = () => {
  const { theme, themes } = React.useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')){
      navigate('/');
    }
  }, [navigate]);
  return (
    <div className={`min-h-screen ${themes[theme].themeClass} flex`}>
      <Sidebar theme={theme} themes={themes} />
      <div className="flex flex-col flex-1">
        <Header theme={theme} themes={themes} />
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
