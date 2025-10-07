import { FaUser, FaUsersSlash, FaUserCheck, FaUserTimes, FaLayerGroup, FaUsers, FaGraduationCap, FaWatchmanMonitoring } from "react-icons/fa";

const commonTabs = [
  { name: "Profile", path: "/dashboard/profile", icon: <FaUser /> },
];

// Role-specific tabs
const roleTabs = {
  Admin: [
    { name: "Create Users", path: "/dashboard/create-users", icon: <FaUsers /> },
    { name: "Block Users", path: "/dashboard/block-users", icon: <FaUsersSlash /> },
    { name: "Unblock Users", path: "/dashboard/unblock-users", icon: <FaUserCheck /> },
    { name: "Delete Users", path: "/dashboard/delete-users", icon: <FaUserTimes /> },
  ],
  "Academic Manager": [
    { name: "Manage Batch", path: "/dashboard/manage-batch", icon: <FaLayerGroup /> },
    { name: "Manage Staff", path: "/dashboard/manage-staff", icon: <FaUsers /> },
    { name: "Manage Academics", path: "/dashboard/manage-academics", icon: <FaGraduationCap /> }
  ],

  "Schedule Manager": [
    { name: "Generate Timetable", path: "/dashboard/generate-timetable", icon: <FaWatchmanMonitoring /> }
  ],
  HR: [
    { name: "Manage Employees", path: "/dashboard/manage-employees", icon: <FaUsers /> },
    { name: "Pay Roll", path: "/dashboard/pay-roll", icon: <FaLayerGroup /> }
  ]
  // Add more roles here...
};

export const getTabsForRole = (role) => {
  return [...commonTabs, ...(roleTabs[role] || [])];
};
