import { FaUser, FaUserPlus, FaUsersSlash, FaUserCheck, FaUserTimes, FaLayerGroup } from "react-icons/fa";

const commonTabs = [
  { name: "Profile", path: "/dashboard/profile", icon: <FaUser /> },
];

// Role-specific tabs
const roleTabs = {
  Admin: [
    { name: "Add User", path: "/dashboard/add-user", icon: <FaUserPlus /> },
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
