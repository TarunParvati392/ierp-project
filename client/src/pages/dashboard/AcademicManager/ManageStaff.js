import AssignDean from "../../../components/Roles/AcademicManager/AssignDean";
import DeAssignDean from "../../../components/Roles/AcademicManager/DeAssignDean";
import AssignHoD from "../../../components/Roles/AcademicManager/AssignHod";
import DeassignHOD from "../../../components/Roles/AcademicManager/DeassignHOD";
import AssignFaculty from "../../../components/Roles/AcademicManager/AssignFaculty";
import DeassignFaculty from "../../../components/Roles/AcademicManager/DeAssignFaculty";

const ManageStaffTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Staff</h2>
      <AssignDean />
      <DeAssignDean />
      <AssignHoD />
      <DeassignHOD />
      <AssignFaculty />
      <DeassignFaculty />
    </div>
  );
};

export default ManageStaffTab;
