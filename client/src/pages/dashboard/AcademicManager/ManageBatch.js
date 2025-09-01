import CreateBatchForm from "../../../components/Roles/AcademicManager/CreateBatch";

const ManageBatchTab = () => {
  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold mb-4">Manage Batches and Sections</h2>
        <CreateBatchForm />
    </div>
  );
};

export default ManageBatchTab;
