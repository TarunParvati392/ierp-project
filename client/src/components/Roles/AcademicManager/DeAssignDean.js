import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeAssignDean = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [deanName, setDeanName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all schools
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/schools`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setSchools(res.data))
      .catch(() => toast.error("Failed to fetch schools"));
  }, []);

  // 🔹 Fetch Dean assigned to school
  useEffect(() => {
    if (selectedSchool) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/staff/dean-by-school/${selectedSchool}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data && res.data.dean) {
            setDeanName(`${res.data.dean.name} (${res.data.dean.userId})`);
          } else {
            setDeanName("");
          }
        })
        .catch(() => {
          setDeanName("");
          toast.error("Error fetching dean for this school");
        });
    } else {
      setDeanName("");
    }
  }, [selectedSchool]);

  // 🔹 Handle De-Assign
  const handleDeAssignDean = async () => {
    if (!selectedSchool) {
      toast.error("Please select a school");
      return;
    }
    if (!deanName) {
      toast.error("No Dean is assigned to this school");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/staff/deassign-dean`,
        { schoolId: selectedSchool },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Dean De-Assigned Successfully!");
      setSelectedSchool("");
      setDeanName("");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error de-assigning dean";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${Styles.card} space-y-4 rounded-xl`}>
      <h3 className="text-xl font-semibold">De-Assign Dean from School</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium">Select School</label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
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

        {/* Dean Name (Read Only) */}
        <div>
          <label className="block mb-1 text-sm font-medium">Dean Name</label>
          <input
            type="text"
            value={deanName}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-200 text-gray-700"
            placeholder="No Dean Assigned"
            readOnly
          />
        </div>
      </div>

      <button
        onClick={handleDeAssignDean}
        className={`py-2 px-4 rounded transition-all duration-300 font-medium text-white mt-4 bg-red-600 hover:bg-red-700`}
        disabled={loading}
      >
        {loading ? "De-Assigning..." : "De-Assign Dean"}
      </button>

    </div>
  );
};

export default DeAssignDean;
