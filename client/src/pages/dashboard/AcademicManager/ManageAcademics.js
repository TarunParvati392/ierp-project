import CreateAcademicYear from "../../../components/Roles/AcademicManager/AcademicYear";

const ManageAcademicsTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Academics</h2>
        <CreateAcademicYear />
    </div>
  );
};

export default ManageAcademicsTab;
