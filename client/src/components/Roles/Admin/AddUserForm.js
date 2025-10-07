import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUserForm = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [roles] = useState([
    "Admin",
    "Academic Manager",
    "Faculty",
    "Dean",
    "HOD",
    "Asset Manager",
    "Grievance Manager",
    "Schedule Manager",
    "Student",
    "HR",
  ]);

  const [form, setForm] = useState({
    role: "",
    name: "",
    email: "",
    degree_id: "",
    specialization_id: "",
    batch_id: "",
  });

  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  // 🔹 Fetch all degrees on load
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/degrees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDegrees(res.data))
      .catch((err) => console.error("Error loading degrees:", err));
  }, []);

  // 🔹 Fetch specializations on degree change
  useEffect(() => {
    if (selectedDegree) {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/degrees/specializations/${selectedDegree}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then((res) => {
          setSpecializations(res.data);
          if (res.data.length === 0) {
            // No specialization → fetch batches directly
            fetchBatches(selectedDegree, null);
          } else {
            setBatches([]);
          }
        })
        .catch((err) => console.error("Error loading specializations:", err));
    } else {
      setSpecializations([]);
      setBatches([]);
    }
  }, [selectedDegree]);

  // 🔹 Fetch batches on specialization change
  useEffect(() => {
    if (selectedDegree && selectedSpecialization) {
      fetchBatches(selectedDegree, selectedSpecialization);
    }
  }, [selectedDegree, selectedSpecialization]);

  // 🔹 Fetch Batches function
  const fetchBatches = async (degreeId, specializationId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/degrees/batches/${degreeId}/${specializationId || "null"}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!form.role || !form.name || !form.email) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/admin/create-user`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("User Created Successfully! Credentials sent via Email.");
      setForm({
        role: "",
        name: "",
        email: "",
        degree_id: "",
        specialization_id: "",
        batch_id: "",
      });
      setSelectedDegree("");
      setSelectedSpecialization("");
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMsg = err?.response?.data?.message || "Error creating user";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">Add New User</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
          >
            <option value="">-- Select Role --</option>
            {roles.map((r, idx) => (
              <option key={idx} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
            placeholder="Enter full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm font-medium">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
            placeholder="Enter email"
          />
        </div>

        {/* Student-Specific Fields */}
        {form.role === "Student" && (
          <>
            {/* Degree Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium">Select Degree</label>
              <select
                name="degree_id"
                value={form.degree_id}
                onChange={(e) => {
                  handleChange(e);
                  setSelectedDegree(e.target.value);
                  setForm({ ...form, degree_id: e.target.value, specialization_id: "", batch_id: "" });
                  setSelectedSpecialization("");
                }}
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
              >
                <option value="">-- Select Degree --</option>
                {degrees.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.degree_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization Dropdown (if available) */}
            {specializations.length > 0 && (
              <div>
                <label className="block mb-1 text-sm font-medium">Select Specialization</label>
                <select
                  name="specialization_id"
                  value={form.specialization_id}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectedSpecialization(e.target.value);
                    setForm({ ...form, specialization_id: e.target.value, batch_id: "" });
                  }}
                  className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
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

            {/* Batch Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium">Select Batch</label>
              <select
                name="batch_id"
                value={form.batch_id}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-900"
              >
                <option value="">-- Select Batch --</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchName} ({b.prefix})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <button onClick={handleAddUser} className={`${Styles.button} mt-4`} disabled={loading}>
        {loading ? 'Adding User...' : 'Add User'}
      </button>

    </div>
  );
};

export default AddUserForm;
