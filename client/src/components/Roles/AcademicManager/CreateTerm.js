import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

const CreateTerm = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    termName: "",
    academicYear: "",
    program_id: "",
    batch_id: "",
    subjects: [{ subjectName: "", subjectCode: "" }],
  });

  // 🔹 Load Academic Years
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/academic-years`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then(res => setAcademicYears(res.data))
    .catch(err => console.error(err));
  }, []);

  // 🔹 Load programs when academicYear changes
  useEffect(() => {
    if (form.academicYear) {
      const year = academicYears.find(y => y._id === form.academicYear);
      if (year) setPrograms(year.programs);
    } else {
      setPrograms([]);
    }
    setForm(prev => ({ ...prev, program_id: "", batch_id: "" }));
    setBatches([]);
  }, [form.academicYear, academicYears]);

  // 🔹 Load batches when program changes
  useEffect(() => {
    if (form.program_id) {
      const selectedProgram = programs.find(p => p._id === form.program_id);
      if (selectedProgram) {
        setBatches(selectedProgram.batches || []);
      }
    } else {
      setBatches([]);
    }
    setForm(prev => ({ ...prev, batch_id: "" }));
  }, [form.program_id, programs]);

  // 🔹 Update subjects
  const handleSubjectChange = (index, field, value) => {
    const updated = [...form.subjects];
    updated[index][field] = value;
    setForm({ ...form, subjects: updated });
  };

  const addSubject = () => {
    setForm({ ...form, subjects: [...form.subjects, { subjectName: "", subjectCode: "" }] });
  };

  const removeSubject = (index) => {
    const updated = [...form.subjects];
    updated.splice(index, 1);
    setForm({ ...form, subjects: updated });
  };

  const handleSubmit = async () => {
    // Validate form
  if (!form.termName) return toast.error("Please select a Term");
  if (!form.academicYear) return toast.error("Please select an Academic Year");
  if (!form.program_id) return toast.error("Please select a Program");
  if (!form.batch_id) return toast.error("Please select a Batch");

  for (let i = 0; i < form.subjects.length; i++) {
    const s = form.subjects[i];
    if (!s.subjectName.trim() || !s.subjectCode.trim()) {
      return toast.error(`Please enter Subject Name and Code for Subject ${i + 1}`);
    }
  }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/terms/create`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const msg = res?.data?.message || "Term Created!";
      toast.success(msg);
    } catch (err) {
      console.error(err);
      // Try to show all error messages from backend
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.message) toast.error(data.message);
        if (data.errors) {
          // If errors is an object with multiple fields
          if (typeof data.errors === 'object') {
            Object.values(data.errors).forEach(e => {
              if (typeof e === 'string') toast.error(e);
              else if (e?.message) toast.error(e.message);
            });
          } else if (typeof data.errors === 'string') {
            toast.error(data.errors);
          }
        }
      } else {
        toast.error("Error creating term");
      }
    }
  };

  return (
    <div className={`${Styles.card} rounded-xl p-4`}>
      <h3 className="text-xl font-semibold mb-4">Create Term</h3>

      {/* Term Dropdown */}
      <select
        value={form.termName}
        onChange={(e) => setForm({ ...form, termName: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      >
        <option value="">-- Select Term --</option>
        {["Term 1", "Term 2", "Term 3", "Term 4"].map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Academic Year Dropdown */}
      <select
        value={form.academicYear}
        onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      >
        <option value="">-- Select Academic Year --</option>
        {academicYears.map(y => (
          <option key={y._id} value={y._id}>{y.academicYear}</option>
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
          className="w-full border rounded px-3 py-2 mb-2"
        >
          <option value="">-- Select Batch --</option>
          {batches.length === 0 && <option disabled>No batches available</option>}
          {batches.map(b => (
            <option key={b._id} value={b._id}>
              {b.batchName || b.batch_name}
            </option>
          ))}
        </select>
      )}

      {/* Subjects */}
      <h4 className="font-semibold mt-3 mb-2">Subjects</h4>
      {form.subjects.map((s, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Subject Name"
            value={s.subjectName}
            onChange={(e) => handleSubjectChange(idx, "subjectName", e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Subject Code"
            value={s.subjectCode}
            onChange={(e) => handleSubjectChange(idx, "subjectCode", e.target.value)}
            className="w-1/2 border rounded px-3 py-2"
          />
          <button type="button" onClick={() => removeSubject(idx)} className="text-red-600 font-bold">✕</button>
        </div>
      ))}
      <div className="flex gap-3 mt-4">
      <button onClick={addSubject} className={`${Styles.button}`}>
        + Add Subject
      </button>
      <button onClick={handleSubmit} className={`${Styles.button}`}>
        Save Term
      </button>
      </div>
    </div>
  );
};

export default CreateTerm;
