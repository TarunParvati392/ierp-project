import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = [
  "9:30 - 10:20",
  "10:20 - 11:10",
  "11:10 - 12:00",
  "12:00 - 12:50",
  "1:20 - 2:10",
  "2:10 - 3:00",
  "3:00 - 3:50",
  "3:50 - 4:40",
];

const GenerateTimetable = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [years, setYears] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // backend preview

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // --- Load academic years ---
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/academic-years`, authHeaders());
        setYears(res.data || []);
      } catch (err) {
        toast.error("Failed to load academic years");
      }
    })();
  }, []);

  // --- Load schools ---
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/schools`, authHeaders());
        setSchools(res.data || []);
      } catch (err) {
        toast.error("Failed to load schools");
      }
    })();
  }, []);

  // --- Load departments when school changes ---
  useEffect(() => {
    if (!selectedSchool) {
      setDepartments([]);
      setSelectedDepartment("");
      return;
    }
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/departments/by-school/${selectedSchool}`, authHeaders());
        setDepartments(res.data || []);
      } catch (err) {
        toast.error("Failed to load departments");
      }
    })();
  }, [selectedSchool]);

  // --- Generate timetable ---
  const handleGenerate = async () => {
    if (!selectedYear || !selectedDepartment) {
      toast.error("Select Academic Year and Department first");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/timetable/generate`,
        { academicYear: selectedYear, departmentId: selectedDepartment },
        authHeaders()
      );
      setPreview(res.data.preview);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  // --- Publish timetable ---
  const handlePublish = async () => {
    if (!preview) {
      toast.error("Generate timetable first");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/timetable/publish`, preview, authHeaders());
      toast.success("Timetable published successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish timetable");
    }
  };

  // --- Render timetable grid ---
  const renderGrid = (title, entries) => (
    <div className="overflow-x-auto mb-6">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Period</th>
            {DAYS.map(d => (
              <th key={d} className="border px-2 py-1">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((p, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1 font-medium">{p}</td>
              {DAYS.map(d => {
                const entry = entries.find(e => e.day === d && e.period === idx + 1);
                return (
                  <td key={d} className="border px-2 py-1 text-center">
                    {entry ? (
                      <div>
                        <div className="font-semibold text-sm">{entry.subjectName}</div>
                        <div className="text-xs">{entry.facultyName || entry.section}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Free</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`${Styles.card} p-4 rounded-xl`}>
      <h3 className="text-xl font-semibold mb-4">Generate Timetable</h3>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-3 py-2">
          <option value="">-- Academic Year --</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.academicYear}</option>)}
        </select>
        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="border rounded px-3 py-2 bg-white text-black">
          <option value="">-- School --</option>
          {schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}
        </select>
        <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="border rounded px-3 py-2 bg-white text-black" disabled={!selectedSchool}>
          <option value="">-- Department --</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button onClick={handleGenerate} disabled={loading} className={`${Styles.button} bg-blue-600 text-white`}>
          {loading ? "Generating..." : "Generate Timetable"}
        </button>
        {preview && (
          <button onClick={handlePublish} className={`${Styles.button} bg-green-600 text-white`}>
            Publish Timetable
          </button>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          {/* Faculty timetable */}
          {renderGrid("Faculty Timetable", preview.facultyEntries || [])}
          {/* Section timetables */}
          {preview.sections?.map(sec => renderGrid(`Section ${sec.sectionName}`, sec.entries))}
        </div>
      )}
    </div>
  );
};

export default GenerateTimetable;
