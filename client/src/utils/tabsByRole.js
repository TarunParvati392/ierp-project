import { FaUser, FaUsersSlash, FaUserCheck, FaUserTimes, FaLayerGroup, FaUsers } from "react-icons/fa";

const commonTabs = [
  { name: "Profile", path: "/dashboard/profile", icon: <FaUser /> },
];

// Role-specific tabs
const roleTabs = {
  Admin: [
    { name: "Manage Users", path: "/dashboard/manage-users", icon: <FaUsers /> },
    { name: "Block Users", path: "/dashboard/block-users", icon: <FaUsersSlash /> },
    { name: "Unblock Users", path: "/dashboard/unblock-users", icon: <FaUserCheck /> },
    { name: "Delete Users", path: "/dashboard/delete-users", icon: <FaUserTimes /> }
  ],
  "Academic Manager": [
    { name: "Manage Batch", path: "/dashboard/manage-batch", icon: <FaLayerGroup /> },
  ],
  // Add more roles here...
};

export const getTabsForRole = (role) => {
  return [...commonTabs, ...(roleTabs[role] || [])];
};
