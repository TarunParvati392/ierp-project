// components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaBook, FaClipboardList, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

const tabs = [
  { icon: <FaUser />, name: 'Profile', path: '/dashboard/profile' },
  { icon: <FaBook />, name: 'Courses', path: '/dashboard/courses' },
  { icon: <FaClipboardList />, name: 'Assessments', path: '/dashboard/assessments' },
  { icon: <FaCalendarAlt />, name: 'Calendar', path: '/dashboard/calendar' },
];

const Sidebar = () => {
  const [hovered, setHovered] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Guest';
  const profileImg = user.profileImage || '/default-profile.png';
  return (
    <aside
      className={`bg-[#1f1f1f] transition-all duration-300 h-screen ${
        hovered ? 'w-64' : 'w-20'
      } fixed md:static z-50`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`p-4 flex flex-col transition-all duration-300 ${hovered ? 'items-center' : 'items-center'}`}>
        <img
          src={profileImg}
          alt="Profile"
          className= {`rounded-full border-2 border-indigo-400 transition-all duration-300 ${hovered ? 'w-20 h-20' : 'w-12 h-12'}`}
        />
        {hovered && (
          <p 
            className="mt-3 text-lg font-semibold text-indigo-400 text-center truncate w-full"
            style={{ maxWidth: '90%' }}
          >{userName}</p>
        )}
      </div>

      <nav className="mt-10 space-y-4 px-4">
        {tabs.map((tab, index) => (
          <NavLink
            to={tab.path}
            key={index}
            className={({ isActive }) =>
              `flex items-center space-x-3 py-2 px-2 rounded-md hover:bg-indigo-600 transition-all ${
                isActive ? 'bg-indigo-700' : 'bg-transparent'
              }`
            }
          >
            <span className="text-xl">{tab.icon}</span>
            {hovered && <span className="text-sm">{tab.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 w-full px-4">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center space-x-2 text-red-400 hover:text-red-500 text-sm"
        >
          <FaSignOutAlt className="text-lg" />
          {hovered && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
