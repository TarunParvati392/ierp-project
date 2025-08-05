// pages/dashboard/Home.jsx
import React from 'react';
import DashboardCards from '../../components/DashboardCards';

const Home = () => {
  const role = 'Student'; // TEMP: Replace with dynamic user data

  return (
    <div>
      <DashboardCards role={role} />
    </div>
  );
};

export default Home;
