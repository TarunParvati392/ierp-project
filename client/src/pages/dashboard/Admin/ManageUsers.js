import AddUserForm from "../../../components/Roles/Admin/AddUserForm";

const ManageUsersTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
        <AddUserForm />
    </div>
  );
};

export default ManageUsersTab;
