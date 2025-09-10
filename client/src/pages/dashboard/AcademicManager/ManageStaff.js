import AssignDean from "../../../components/Roles/AcademicManager/AssignDean";
import DeAssignDean from "../../../components/Roles/AcademicManager/DeAssignDean";
import AssignHoD from "../../../components/Roles/AcademicManager/AssignHod";
import DeassignHOD from "../../../components/Roles/AcademicManager/DeassignHOD";

const ManageStaffTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Staff</h2>
      <AssignDean />
      <DeAssignDean />
      <AssignHoD />
      <DeassignHOD />
    </div>
  );
};

export default ManageStaffTab;
