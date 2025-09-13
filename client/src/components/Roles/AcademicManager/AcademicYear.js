import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

const CreateAcademicYear = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [form, setForm] = useState({
    academicYear: "",
    programs: [{ degree_id: "", specialization_id: "", batch_id: "", startDate: "", endDate: "" }],
  });

  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([[]]); // per program index
  const [batches, setBatches] = useState([[]]); // per program index
  const [batchDropdownOpen, setBatchDropdownOpen] = useState([]); // per program index

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
        updated[idx] = res.data; // ✅ FIX: store specializations properly
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
    if (field === "batches") {
      updated[index][field] = value; // value is array of batch ids
    } else {
      updated[index][field] = value;
    }

    if (field === "startDate") {
      // Always auto-set end date to exactly one year after start date (minus one day)
      if (value) {
        const start = new Date(value);
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        updated[index]["endDate"] = end.toISOString().slice(0, 10);
      } else {
        updated[index]["endDate"] = "";
      }
      setForm({ ...form, programs: updated });
      return;
    }

    if (field === "degree_id") {
      updated[index]["specialization_id"] = "";
      updated[index]["batches"] = [];
      setForm({ ...form, programs: updated });
      fetchSpecializations(value, index);
    } else if (field === "specialization_id") {
      updated[index]["batches"] = [];
      setForm({ ...form, programs: updated });
      fetchBatches(updated[index]["degree_id"], value, index);
    } else {
      setForm({ ...form, programs: updated });
    }
  };

  const addProgram = () => {
    setForm({
      ...form,
      programs: [...form.programs, { degree_id: "", specialization_id: "", batch_id: "", startDate: "", endDate: "" }],
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

  const [specializationErrors, setSpecializationErrors] = useState([]);

  const handleSubmit = async () => {
    // Validate dates and specialization for each program
    let specErrors = [];
    for (const [idx, p] of form.programs.entries()) {
      if (!p.startDate || !p.endDate) {
        toast.error(`Please enter start and end date for Program ${idx + 1}`);
        return;
      }
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      // Check if exactly one year (365 days difference, not less or more)
      const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays !== 364) {
        toast.error(`Start and End date must be exactly one year apart for Program ${idx + 1}`);
        return;
      }
      if (end <= start) {
        toast.error(`End date must be after start date for Program ${idx + 1}`);
        return;
      }
      // Specialization mandatory if specializations are loaded for this degree
      if (specializations[idx] && specializations[idx].length > 0 && !p.specialization_id) {
        specErrors[idx] = true;
        toast.error(`Please select specialization for Program ${idx + 1}`);
        setSpecializationErrors(specErrors);
        return;
      } else {
        specErrors[idx] = false;
      }
    }
    setSpecializationErrors(specErrors);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/academic-years/create`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Academic Year Created!");
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Error creating academic year";
      toast.error(errorMsg);
    }
  };

  return (
    <div className={`${Styles.card} rounded-xl p-4`}>
      <h3 className="text-xl font-semibold mb-4">Create Academic Year</h3>

      {/* Year Name */}
      <input
        type="text"
        placeholder="Academic Year (e.g. 2025-26)"
        value={form.academicYear}
        onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
        className="w-full border rounded px-3 py-2 my-2 bg-white text-black"
      />

      {/* Dates removed from global form, now per program */}

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
              {/* Start/End Date for each program */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={p.startDate}
                  onChange={e => updateProgram(idx, "startDate", e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-black"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={p.endDate}
                  onChange={e => updateProgram(idx, "endDate", e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-black"
                  placeholder="End Date"
                />
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

              {/* Specialization Dropdown (only if degree has specializations) */}
              {p.degree_id && specializations[idx] && specializations[idx].length > 0 && (
                <>
                  <select
                    value={p.specialization_id}
                    onChange={(e) => updateProgram(idx, "specialization_id", e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-2 bg-white text-black"
                  >
                    <option value="">-- Select Specialization --</option>
                    {specializations[idx].map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.specialization_name}
                      </option>
                    ))}
                  </select>
                  {specializationErrors[idx] && (
                    <div className="text-red-600 text-sm mb-2">Specialization is required for this program.</div>
                  )}
                </>
              )}

              {/* Batch Multi-select Dropdown with Checkboxes */}
              {p.degree_id && ((specializations[idx] && specializations[idx].length === 0) || p.specialization_id) && (
                <div className="relative mb-2">
                  <div
                    className="w-full border rounded px-3 py-2 bg-white text-black cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setBatchDropdownOpen(prev => {
                        const arr = [...prev];
                        arr[idx] = !arr[idx];
                        return arr;
                      });
                    }}
                  >
                    {Array.isArray(p.batches) && p.batches.length > 0
                      ? `${p.batches.length} batch(es) selected`
                      : "-- Select Batch(es) --"}
                    <span className="ml-2">▼</span>
                  </div>
                  {batchDropdownOpen[idx] && (
                    <div className="absolute z-10 bg-white border rounded shadow-md mt-1 w-full max-h-40 overflow-y-auto">
                      {batches[idx] && batches[idx].length === 0 && (
                        <div className="text-gray-500 px-3 py-2">No batches available</div>
                      )}
                      {batches[idx] && batches[idx].map((b) => (
                        <label key={b._id} className="flex items-center gap-1 px-3 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Array.isArray(p.batches) && p.batches.includes(b._id)}
                            onChange={e => {
                              let newBatches = Array.isArray(p.batches) ? [...p.batches] : [];
                              if (e.target.checked) {
                                newBatches.push(b._id);
                              } else {
                                newBatches = newBatches.filter(id => id !== b._id);
                              }
                              updateProgram(idx, "batches", newBatches);
                            }}
                          />
                          {b.batchName ? `${b.batchName} (${b.prefix})` : b.batch_name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
