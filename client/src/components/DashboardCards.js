// components/DashboardCards.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tabsByRole } from '../utils/roleTabs';

const DashboardCards = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'guest'; // Default to 'guest' if no role found
  const tabs = tabsByRole[role] || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {tabs.map((tab, idx) => (
        <div
          key={idx}
          onClick={() => navigate(tab.path)}
          className="cursor-pointer bg-[#1f1f1f] hover:bg-indigo-600 transition-all p-6 rounded-xl shadow-md flex flex-col items-center text-center border border-white/10"
        >
          <div className="text-3xl text-indigo-400 mb-3">{tab.icon}</div>
          <div className="text-white text-md font-medium">{tab.name}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
