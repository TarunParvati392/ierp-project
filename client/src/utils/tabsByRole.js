import { FaUser, FaUsers, FaUserShield, FaClipboardList } from "react-icons/fa";

const commonTabs = [
  { name: "Profile", path: "/dashboard/profile", icon: <FaUser /> },
];

// Role-specific tabs
const roleTabs = {
  Admin: [
    { name: "Add User", path: "/dashboard/add-user", icon: <FaUserShield /> },
    { name: "Manage Users", path: "/dashboard/manage-users", icon: <FaUsers /> },
  ],
  Faculty: [
    { name: "My Classes", path: "/dashboard/classes", icon: <FaClipboardList /> },
  ],
  Student: [
    { name: "My Courses", path: "/dashboard/courses", icon: <FaClipboardList /> },
  ],
  // Add more roles here...
};

export const getTabsForRole = (role) => {
  return [...commonTabs, ...(roleTabs[role] || [])];
};
