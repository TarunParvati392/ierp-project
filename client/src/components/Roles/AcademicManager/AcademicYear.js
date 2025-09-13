import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

const CreateAcademicYear = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [form, setForm] = useState({
    yearName: "",
    startDate: "",
    endDate: "",
    programs: [],
  });

  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState({});
  const [batches, setBatches] = useState({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/degrees`)
      .then(res => setDegrees(res.data))
      .catch(err => console.error(err));
  }, []);


  const addProgram = () => {
    setForm({
      ...form,
      programs: [...form.programs, { degree_id: "", specialization_id: "", batch_id: "" }],
    });
  };

  const removeProgram = (index) => {
    const updated = [...form.programs];
    updated.splice(index, 1);
    setForm({ ...form, programs: updated });
  };

  const updateProgram = (index, field, value) => {
    const updated = [...form.programs];
    updated[index][field] = value;
    setForm({ ...form, programs: updated });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/academic-years`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Academic Year Created!");
    } catch (err) {
      console.error(err);
      alert("Error creating academic year");
    }
  };

  return (
    <div className={`${Styles.card} rounded-xl p-4`}>
      <h3 className="text-xl font-semibold">Create Academic Year</h3>

      {/* Year Name */}
      <input
        type="text"
        placeholder="Academic Year (e.g. 2025-26)"
        value={form.yearName}
        onChange={e => setForm({ ...form, yearName: e.target.value })}
        className="w-full border rounded px-3 py-2 my-2"
      />

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          value={form.startDate}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={form.endDate}
          onChange={e => setForm({ ...form, endDate: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="End Date"
        />
      </div>

      <hr className="my-4" />

      {/* Programs */}
      <h4 className="text-lg font-semibold mb-2">Programs</h4>
      {form.programs.map((p, idx) => (
        <div key={idx} className="border p-3 rounded mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Program {idx + 1}</span>
            <button
              type="button"
              className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
              onClick={() => removeProgram(idx)}
              title="Remove Program"
              aria-label="Remove Program"
              disabled={form.programs.length === 1}
            >
              &times;
            </button>
          </div>
          <select
            value={p.degree_id}
            onChange={e => updateProgram(idx, "degree_id", e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="">-- Select Degree --</option>
            {degrees.map(d => (
              <option key={d._id} value={d._id}>{d.degree_name}</option>
            ))}
          </select>

          {/* Specialization (load if exists) */}
          <select
            value={p.specialization_id}
            onChange={e => updateProgram(idx, "specialization_id", e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="">-- Select Specialization --</option>
            {/* load specializations here dynamically */}
          </select>

          {/* Batch Dropdown */}
          <select
            value={p.batch_id}
            onChange={e => updateProgram(idx, "batch_id", e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Batch --</option>
            {/* load batches dynamically */}
          </select>
        </div>
      ))}

      <button onClick={addProgram} className={`${Styles.button} mb-4`}>+ Add Program</button>
      <button onClick={handleSubmit} className={`${Styles.button}`}>Save Academic Year</button>
    </div>
  );
};

export default CreateAcademicYear;
