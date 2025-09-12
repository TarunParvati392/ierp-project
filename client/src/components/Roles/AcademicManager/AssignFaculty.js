import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignFaculty = () => {
    const { theme } = useContext(ThemeContext);
    const Styles = getThemeStyles(theme);

    const [Faculty, setFaculty] = useState([]);
    const [schools, setSchools] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        FacultyId: "",
        schoolId: "",
        departmentId: "",
    });
    const [loading, setLoading] = useState(false);

    // 🔹 Load HODs
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/staff/faculty`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => setFaculty(res.data))
            .catch(() => toast.error("Failed to load Faculty"));
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
        if (!form.FacultyId || !form.schoolId || !form.departmentId) {
            toast.error("All fields are required");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/staff/assign-faculty`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Faculty assigned successfully!");
            setForm({ FacultyId: "", schoolId: "", departmentId: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Error assigning Faculty");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${Styles.card} space-y-4 rounded-xl`}>
            <h3 className="text-xl font-semibold">Assign Faculty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Select Faculty</label>
                    <select
                        name="FacultyId"
                        value={form.FacultyId}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 bg-white text-black"
                    >
                        <option value="">-- Select Faculty --</option>
                        {Faculty.map((faculty) => (
                            <option key={faculty._id} value={faculty._id}>
                                {faculty.name} ({faculty.userId})
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
                {loading ? 'Assigning...' : 'Assign Faculty'}
            </button>

        </div>
    );
};

export default AssignFaculty;
