import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignDean = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [deans, setDeans] = useState([]);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    deanId: "",
    schoolId: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all Deans
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/staff/deans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDeans(res.data))
      .catch(() => toast.error("Failed to fetch Deans"));
  }, []);

  // 🔹 Fetch all Schools
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/schools`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setSchools(res.data))
      .catch(() => toast.error("Failed to fetch Schools"));
  }, []);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Submit
  const handleAssignDean = async () => {
    if (!form.deanId || !form.schoolId) {
      toast.error("Please select both Dean and School");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/staff/assign-dean`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Dean Assigned Successfully!");
      setForm({ deanId: "", schoolId: "" });
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error assigning dean";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Assign Dean to School</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dean Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select Dean</label>
          <select
            name="deanId"
            value={form.deanId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white text-black"
          >
            <option value="">-- Select Dean --</option>
            {deans.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.userId})
              </option>
            ))}
          </select>
        </div>

        {/* School Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select School</label>
          <select
            name="schoolId"
            value={form.schoolId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-white text-black"
          >
            <option value="">-- Select School --</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.school_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleAssignDean}
        className={`${Styles.button} mt-4`}
        disabled={loading}
      >
        {loading ? "Assigning..." : "Assign Dean"}
      </button>

    </div>
  );
};

export default AssignDean;
