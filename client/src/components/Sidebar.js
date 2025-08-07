// components/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { getTabsForRole } from '../utils/tabsByRole';

const Sidebar = () => {
  const [hovered, setHovered] = useState(false);
  const { theme, themes } = useContext(ThemeContext);
  const styles = getThemeStyles(theme);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Guest';
  const profileImg = user.profileImage || '/default-profile.png';
  const tabs = getTabsForRole(user.role);

  return (
    <aside
      className={`${themes[theme].sidebarClass} h-screen z-50 fixed md:static transition-all duration-300 overflow-y-auto scrollbar-thin ${
        hovered ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4 flex flex-col items-center transition-all duration-300">
        <img
          src={profileImg}
          alt="Profile"
          className={`rounded-full transition-all duration-300 border-2 ${
            hovered ? 'w-20 h-20' : 'w-12 h-12'
          } ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-600'}`}
        />
        {hovered && (
          <p
            className={`mt-3 font-semibold text-center truncate w-full transition-all duration-300 ${styles.headerText}`}
            style={{ fontSize: 'clamp(0.9rem, 1vw, 1.2rem)' }}
          >
            {userName}
          </p>
        )}
      </div>

      <nav className="mt-10 space-y-4 px-4 pb-20">
        {tabs.map((tab, index) => (
          <NavLink
            to={tab.path}
            key={index}
            className={({ isActive }) =>
              `flex items-center space-x-3 py-2 px-2 rounded-md transition-all duration-300 ${
                isActive ? styles.activeTab : styles.tab
              }`
            }
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {hovered && <span className="text-sm">{tab.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
