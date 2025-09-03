import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateBatchForm = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState("");

  const [form, setForm] = useState({
    degree_id: "",
    specialization_id: "",
    batchName: "",
    prefix: "",
  });

  // Fetch all degrees
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/degrees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDegrees(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch specializations based on degree
  useEffect(() => {
    if (selectedDegree) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/degrees/specializations/${selectedDegree}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setSpecializations(res.data))
        .catch((err) => console.error(err));
    } else {
      setSpecializations([]);
    }
  }, [selectedDegree]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateBatch = async () => {
    if (!form.degree_id || !form.batchName || !form.prefix) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/batches`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Batch Created Successfully!");
      setForm({ degree_id: "", specialization_id: "", batchName: "", prefix: "" });
      setSelectedDegree("");
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Error creating batch";
      toast.error(errorMsg);
    }
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Create Batch</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Degree Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select Degree</label>
          <select
            name="degree_id"
            value={form.degree_id}
            onChange={(e) => {
              handleChange(e);
              setSelectedDegree(e.target.value);
            }}
            className="w-full border rounded px-3 py-2 bg-white text-black"
          >
            <option value="">-- Select Degree --</option>
            {degrees.map((d) => (
              <option key={d._id} value={d._id}>
                {d.degree_name}
              </option>
            ))}
          </select>
        </div>

        {/* Specialization Dropdown */}
        {specializations.length > 0 && (
          <div>
            <label className="block mb-1 text-sm font-medium">Select Specialization</label>
            <select
              name="specialization_id"
              value={form.specialization_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white text-black"
            >
              <option value="">-- Select Specialization --</option>
              {specializations.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.specialization_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Batch Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Batch Name</label>
          <input
            type="text"
            name="batchName"
            value={form.batchName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white text-black"
            placeholder="Eg: MCA 2023-2025"
          />
        </div>

        {/* Prefix */}
        <div>
          <label className="block mb-1 text-sm font-medium">Batch Prefix (UID)</label>
          <input
            type="text"
            name="prefix"
            value={form.prefix}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white text-black"
            placeholder="Eg: MCA23"
          />
        </div>
      </div>

      <button
        onClick={handleCreateBatch}
        className={`${Styles.button} mt-4`}
      >
        Create Batch
      </button>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </div>
  );
};

export default CreateBatchForm;
