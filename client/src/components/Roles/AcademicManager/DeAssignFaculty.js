import React, { useState, useEffect, useContext, use } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import "react-toastify/dist/ReactToastify.css";

const DeassignFaculty = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(false);

  //Fetch All Schools
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/schools`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then((res) => setSchools(res.data))
    .catch(() => toast.error("Failed to fetch schools"));
  }, []);

  //Load Departments When School is Selected
  useEffect(() => {
    if (selectedSchool) {
      axios.get(`${process.env.REACT_APP_API_URL}/schools/departments/${selectedSchool}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDepartments(res.data))
      .catch(() => toast.error("Failed to fetch departments"));
    }
  }, [selectedSchool]);


// Fetch Faculty when Department is Selected
useEffect(() => {
  if (selectedDepartment) {
    axios.get(`${process.env.REACT_APP_API_URL}/staff/faculty/${selectedDepartment}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((res) => setFaculty(res.data.faculty || []))
      .catch(() => toast.error("Error fetching Faculty of this Department"));
    setSelectedFaculty("");
  } else {
    setFaculty([]);
    setSelectedFaculty("");
  }
}, [selectedDepartment]);

// Handle Deassign faculty
const handleDeAssignFaculty = async () => {
  if (!selectedSchool){
    toast.error("Please Select A School");
    return;
  }
  if (!selectedDepartment) {
    toast.error("Please Select A Department");
    return;
  }

  if (!selectedFaculty) {
    toast.error("Please Select A Faculty");
    return;
  }

  try{
    setLoading(true);
    await axios.post(
      `${process.env.REACT_APP_API_URL}/staff/deassign-faculty`,
      { schoolId: selectedSchool, departmentId: selectedDepartment, facultyId: selectedFaculty },
      { headers: { Authorization: `Bearer ${ localStorage.getItem("token") }`}}
    );
    toast.success("Faculty De-Assigned Successfully");
  setSelectedSchool("");
  setSelectedDepartment("");
  setFaculty([]);
  setSelectedFaculty("");
  } catch (err){
    const errorMsg = err?.response?.data?.message || "Failed To De-Assign Faculty";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className= {`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">De-Assign Faculty</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Select School</label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white text-black"
          >
            <option value="">-- Select School --</option>
            {schools.map((s) =>(
              <option key={s._id} value={s._id}>{s.school_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Select Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white text-black"
            disabled={!selectedSchool}
          >
            <option value="">-- Select Department --</option>
            {departments.map((d) =>(
              <option key={d._id} value={d._id}>{d.department_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Select Faculty Name</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white text-black"
            disabled={!selectedDepartment}
          >
            <option value="">-- Select Faculty --</option>
            {faculty.map((f) => (
              <option key={f._id} value={f._id}>{f.name} ({f.userId})</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleDeAssignFaculty}
        className={`py-2 px-4 rounded transition-all duration-300 font-medium text-white mt-4 bg-red-600 hover:bg-red-700`}
        disabled={loading}
      >
        {loading ? "De-Assigning..." : "De-Assign Faculty"}
      </button>
    </div>
  );
};

export default DeassignFaculty;
