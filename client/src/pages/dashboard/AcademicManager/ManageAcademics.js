import CreateAcademicYear from "../../../components/Roles/AcademicManager/AcademicYear";
import CreateTerm from "../../../components/Roles/AcademicManager/CreateTerm";

const ManageAcademicsTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Academics</h2>
        <CreateAcademicYear />
        <CreateTerm />
    </div>
  );
};

export default ManageAcademicsTab;
