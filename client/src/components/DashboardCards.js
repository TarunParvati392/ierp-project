// components/DashboardCards.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { tabsByRole } from '../utils/roleTabs';

const DashboardCards = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'guest';
  const tabs = tabsByRole[role] || [];

  const { theme } = useContext(ThemeContext);
  const styles = getThemeStyles(theme);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {tabs.map((tab, idx) => (
        <div
          key={idx}
          onClick={() => navigate(tab.path)}
          className={`${styles.card} cursor-pointer hover:bg-indigo-600 transition-all flex flex-col items-center text-center`}
        >
          <div className={`${styles.tabIcon} text-3xl mb-3`}>{tab.icon}</div>
          <div className="font-medium">{tab.name}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
