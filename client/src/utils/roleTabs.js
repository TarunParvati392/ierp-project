// utils/roleTabs.js
import { FaUser, FaBook, FaClipboardList, FaCalendarAlt, FaListAlt } from 'react-icons/fa';

export const tabsByRole = {
  Student: [
    { name: 'Profile', path: '/dashboard/profile', icon: <FaUser /> },
    { name: 'Courses', path: '/dashboard/courses', icon: <FaBook /> },
    { name: 'Assessments', path: '/dashboard/assessments', icon: <FaClipboardList /> },
    { name: 'Calendar', path: '/dashboard/calendar', icon: <FaCalendarAlt /> },
    { name: 'Attendance', path: '/dashboard/attendance', icon: <FaListAlt /> },
  ],
  Admin: [
    { name: 'Add User', path: '/dashboard/add-user', icon: <FaUser /> },
    { name: 'Manage Users', path: '/dashboard/manage-users', icon: <FaClipboardList /> },
  ],
  // Add other roles here...
};
