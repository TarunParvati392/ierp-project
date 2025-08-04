import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/dashboard/Home';
import FaceSetupPage from './pages/FaceSetupPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path='/face-setup' element={<FaceSetupPage />} />
        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path='' element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
