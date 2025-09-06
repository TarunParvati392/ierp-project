import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/dashboard/Home';
//import FaceSetupPage from './pages/FaceSetupPage';
//import Profile from './pages/dashboard/Profile';
import ProfileTab from './pages/dashboard/ProfileTab';
import ManageBatchTab from './pages/dashboard/AcademicManager/ManageBatch';
import ManageUsersTab from './pages/dashboard/Admin/ManageUsers';
import BlockUsers from './pages/dashboard/Admin/BlockUsers';
import UnBlock from './pages/dashboard/Admin/UnBlock';
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
          <Route path="profile" element={<ProfileTab />} />
          <Route path="manage-batch" element={<ManageBatchTab />} />
          <Route path="create-users" element={<ManageUsersTab />} />
          <Route path="block-users" element={<BlockUsers />} />
          <Route path="unblock-users" element={<UnBlock />} />
        </Route>
      </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
