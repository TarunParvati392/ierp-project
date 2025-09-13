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
    programs: [{ degree_id: "", specialization_id: "", batch_id: "" }],
  });

  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([[]]); // per program index
  const [batches, setBatches] = useState([[]]); // per program index

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/degrees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDegrees(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Fetch specializations for a degree (per program row)
  const fetchSpecializations = async (degreeId, idx) => {
    if (!degreeId) {
      setSpecializations((prev) => {
        const updated = [...prev];
        updated[idx] = [];
        return updated;
      });
      setBatches((prev) => {
        const updated = [...prev];
        updated[idx] = [];
        return updated;
      });
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/degrees/specializations/${degreeId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setSpecializations((prev) => {
        const updated = [...prev];
        updated[idx] = res.data;
        return updated;
      });

      if (!res.data || res.data.length === 0) {
        // No specialization → fetch batches directly
        fetchBatches(degreeId, null, idx);
      } else {
        setBatches((prev) => {
          const updated = [...prev];
          updated[idx] = [];
          return updated;
        });
      }
    } catch (err) {
      console.error("Error loading specializations:", err);
    }
  };

  // 🔹 Fetch batches for a degree/specialization (per program row)
  const fetchBatches = async (degreeId, specializationId, idx) => {
    if (!degreeId) return;

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/degrees/batches/${degreeId}/${specializationId || "null"}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setBatches((prev) => {
        const updated = [...prev];
        updated[idx] = res.data;
        return updated;
      });
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  // 🔹 Update program and trigger dependent loads
  const updateProgram = (index, field, value) => {
    const updated = [...form.programs];
    updated[index][field] = value;

    if (field === "degree_id") {
      updated[index]["specialization_id"] = "";
      updated[index]["batch_id"] = "";
      setForm({ ...form, programs: updated });
      fetchSpecializations(value, index);
    } else if (field === "specialization_id") {
      updated[index]["batch_id"] = "";
      setForm({ ...form, programs: updated });
      fetchBatches(updated[index]["degree_id"], value, index);
    } else {
      setForm({ ...form, programs: updated });
    }
  };

  const addProgram = () => {
    setForm({
      ...form,
      programs: [...form.programs, { degree_id: "", specialization_id: "", batch_id: "" }],
    });
    setSpecializations((prev) => [...prev, []]);
    setBatches((prev) => [...prev, []]);
  };

  const removeProgram = (index) => {
    const updated = [...form.programs];
    updated.splice(index, 1);
    setForm({ ...form, programs: updated });

    setSpecializations((prev) => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
    setBatches((prev) => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
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
      <h3 className="text-xl font-semibold mb-4">Create Academic Year</h3>

      {/* Year Name */}
      <input
        type="text"
        placeholder="Academic Year (e.g. 2025-26)"
        value={form.yearName}
        onChange={(e) => setForm({ ...form, yearName: e.target.value })}
        className="w-full border rounded px-3 py-2 my-2 bg-white text-black"
      />

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full border rounded px-3 py-2 bg-white text-black"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="w-full border rounded px-3 py-2 bg-white text-black"
          placeholder="End Date"
        />
      </div>

      <hr className="my-4" />

      {/* Programs */}
      <h4 className="text-lg font-semibold mb-2">Programs</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {form.programs.map((p, idx) => (
          <div key={idx} className="border rounded-xl p-4 shadow-md bg-white min-h-[270px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Program {idx + 1}</span>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
                  onClick={() => removeProgram(idx)}
                  disabled={form.programs.length === 1}
                >
                  &times;
                </button>
              </div>

              {/* Degree Dropdown */}
              <select
                value={p.degree_id}
                onChange={(e) => updateProgram(idx, "degree_id", e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2 bg-white text-black"
              >
                <option value="">-- Select Degree --</option>
                {degrees.length === 0 && <option disabled>Loading degrees...</option>}
                {degrees.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.degree_name}
                  </option>
                ))}
              </select>

              {/* Specialization Dropdown (always show if degree selected) */}
              {p.degree_id && (
                <select
                  value={p.specialization_id}
                  onChange={(e) => updateProgram(idx, "specialization_id", e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2 bg-white text-black"
                  disabled={specializations[idx] && specializations[idx].length === 0}
                >
                  <option value="">-- Select Specialization --</option>
                  {specializations[idx] && specializations[idx].length === 0 && (
                    <option disabled>No specializations available</option>
                  )}
                  {specializations[idx] && specializations[idx].map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.specialization_name}
                    </option>
                  ))}
                </select>
              )}

              {/* Batch Dropdown (always show if degree selected and (no specializations or specialization selected)) */}
              {p.degree_id && ((specializations[idx] && specializations[idx].length === 0) || p.specialization_id) && (
                <select
                  value={p.batch_id}
                  onChange={(e) => updateProgram(idx, "batch_id", e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-black"
                >
                  <option value="">-- Select Batch --</option>
                  {batches[idx] && batches[idx].length === 0 && (
                    <option disabled>No batches available</option>
                  )}
                  {batches[idx] &&
                    batches[idx].map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchName ? `${b.batchName} (${b.prefix})` : b.batch_name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={addProgram} className={`${Styles.button}`}>
          + Add Program
        </button>
        <button onClick={handleSubmit} className={`${Styles.button}`}>
          Save Academic Year
        </button>
      </div>
    </div>
  );
};

export default CreateAcademicYear;
