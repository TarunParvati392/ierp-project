import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignHOD = () => {
    const { theme } = useContext(ThemeContext);
    const Styles = getThemeStyles(theme);

    const [HODs, setHODs] = useState([]);
    const [schools, setSchools] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        HODId: "",
        schoolId: "",
        departmentId: "",
    });
    const [loading, setLoading] = useState(false);

    // 🔹 Load HODs
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/staff/HODs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => setHODs(res.data))
            .catch(() => toast.error("Failed to load HODs"));
    }, []);

    // 🔹 Load Schools
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/schools`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => setSchools(res.data))
            .catch(() => toast.error("Failed to load schools"));
    }, []);

    // 🔹 Load Departments when School selected
    useEffect(() => {
        if (form.schoolId) {
            axios
                .get(`${process.env.REACT_APP_API_URL}/schools/departments/${form.schoolId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
                .then((res) => setDepartments(res.data))
                .catch(() => toast.error("Failed to load departments"));
        } else {
            setDepartments([]);
        }
    }, [form.schoolId]);

    // 🔹 Handle change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Submit
    const handleAssign = async () => {
        if (!form.HODId || !form.schoolId || !form.departmentId) {
            toast.error("All fields are required");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/staff/assign-HOD`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("HOD assigned successfully!");
            setForm({ HODId: "", schoolId: "", departmentId: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Error assigning HOD");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${Styles.card} space-y-4 rounded-xl`}>
            <h3 className="text-xl font-semibold">Assign HOD</h3>

            {/* HOD Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Select HOD</label>
                    <select
                        name="HODId"
                        value={form.HODId}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 bg-white text-black"
                    >
                        <option value="">-- Select HOD --</option>
                        {HODs.map((HOD) => (
                            <option key={HOD._id} value={HOD._id}>
                                {HOD.name} ({HOD.userId})
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
                        {schools.map((school) => (
                            <option key={school._id} value={school._id}>
                                {school.school_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Department Dropdown */}
                <div>
                    <label className="block mb-1 text-sm font-medium">Select Department</label>
                    <select
                        name="departmentId"
                        value={form.departmentId}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 bg-white text-black"
                        disabled={!form.schoolId}
                    >
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.department_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button onClick={handleAssign} className={`${Styles.button} mt-4`} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign HOD'}
            </button>

        </div>
    );
};

export default AssignHOD;
