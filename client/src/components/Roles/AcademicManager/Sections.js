import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

const ManageSections = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchDetails, setBatchDetails] = useState(null);

  const [form, setForm] = useState({
    academicYear: "",
    program_id: "",
    batch_id: "",
    sectionName: "",
    fromUid: "",
    toUid: "",
  });

  // 🔹 Load Academic Years
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/academic-years`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setAcademicYears(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Load Programs when Academic Year changes
  useEffect(() => {
    if (form.academicYear) {
      const year = academicYears.find((y) => y._id === form.academicYear);
      if (year) setPrograms(year.programs);
    } else {
      setPrograms([]);
    }
    setForm((prev) => ({ ...prev, program_id: "", batch_id: "" }));
    setBatches([]);
    setBatchDetails(null);
  }, [form.academicYear, academicYears]);

  // 🔹 Load Batches when Program changes
  useEffect(() => {
    if (form.program_id) {
      const selectedProgram = programs.find((p) => p._id === form.program_id);
      if (selectedProgram) {
        setBatches(selectedProgram.batches || []);
      }
    } else {
      setBatches([]);
    }
    setForm((prev) => ({ ...prev, batch_id: "" }));
    setBatchDetails(null);
  }, [form.program_id, programs]);

  // 🔹 Fetch batch details (students + UIDs + sections)
  useEffect(() => {
    if (form.batch_id) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/sections/batch-details/${form.batch_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setBatchDetails(res.data))
        .catch((err) => console.error("Error fetching batch details:", err));
    } else {
      setBatchDetails(null);
    }
  }, [form.batch_id]);

  // 🔹 Handle Form Submission
  const handleSubmit = async () => {
    if (!form.sectionName || !form.fromUid || !form.toUid) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/sections/create`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Section created successfully!");
      setForm((prev) => ({ ...prev, sectionName: "", fromUid: "", toUid: "" }));

      // Refresh batch details
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/sections/batch-details/${form.batch_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBatchDetails(res.data);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error creating section");
    }
  };

  return (
    <div className={`${Styles.card} rounded-xl p-4`}>
      <h3 className="text-xl font-semibold mb-4">Create Sections</h3>

      {/* Academic Year Dropdown */}
      <select
        value={form.academicYear}
        onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      >
        <option value="">-- Select Academic Year --</option>
        {academicYears.map((y) => (
          <option key={y._id} value={y._id}>
            {y.academicYear}
          </option>
        ))}
      </select>

      {/* Program Dropdown */}
      <select
        value={form.program_id}
        onChange={(e) => setForm({ ...form, program_id: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
        disabled={!form.academicYear}
      >
        <option value="">-- Select Program --</option>
        {programs.map((p, idx) => (
          <option key={p._id || idx} value={p._id}>
            {p.degree_id?.degree_name}
            {p.specialization_id ? ` - ${p.specialization_id.specialization_name}` : ""}
          </option>
        ))}
      </select>

      {/* Batch Dropdown */}
      {form.program_id && (
        <select
          value={form.batch_id}
          onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.batchName}
            </option>
          ))}
        </select>
      )}

      {/* Batch Details */}
      {batchDetails && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p><b>Total Students:</b> {batchDetails.totalStudents}</p>
          <p><b>UID Range:</b> {batchDetails.allUids[0]} → {batchDetails.allUids[batchDetails.allUids.length - 1]}</p>
          <p className="mt-2 font-semibold">Existing Sections:</p>
          {batchDetails.sections.length === 0 ? (
            <p>No sections created yet.</p>
          ) : (
            <ul className="list-disc ml-5">
              {batchDetails.sections.map((s, idx) => (
                <li key={idx}>
                  {s.sectionName}: {s.fromUid} → {s.toUid} ({s.strength} students)
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* New Section Form */}
      {form.batch_id && (
        <div className="border rounded p-4 mb-4">
          <h4 className="font-semibold mb-2">Create New Section</h4>
          <input
            type="text"
            placeholder="Section Name (e.g. A)"
            value={form.sectionName}
            onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="From UID"
              value={form.fromUid}
              onChange={(e) => setForm({ ...form, fromUid: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="To UID"
              value={form.toUid}
              onChange={(e) => setForm({ ...form, toUid: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button onClick={handleSubmit} className={`${Styles.button} mt-3`}>
            Save Section
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageSections;
