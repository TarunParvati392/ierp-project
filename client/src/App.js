import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/dashboard/Home';
import FaceSetupPage from './pages/FaceSetupPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
