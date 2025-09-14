import CreateBatchForm from "../../../components/Roles/AcademicManager/CreateBatch";
import ManageSections from "../../../components/Roles/AcademicManager/Sections";

const ManageBatchTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Batches and Sections</h2>
        <CreateBatchForm />
        <ManageSections />
    </div>
  );
};

export default ManageBatchTab;
