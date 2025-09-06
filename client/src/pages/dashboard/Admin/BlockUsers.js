
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BlockUsers = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  // Filter UI state
  const [filterType, setFilterType] = useState('role'); // 'role', 'degree', or 'batch'
  const [allBatches, setAllBatches] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [roleOptions] = useState([
    "Admin",
    "Academic Manager",
    "Faculty",
    "Dean",
    "Hod",
    "Asset Manager",
    "Grievance Manager",
    "Schedule Manager",
    "Student",
  ]);
  const [degreeOptions, setDegreeOptions] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState({}); // { degreeId: [specs] }
  const [batchOptions, setBatchOptions] = useState({}); // { degreeId or specId: [batches] }

  // Selected filters
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedDegrees, setSelectedDegrees] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [sortOption, setSortOption] = useState("latest");

  const [blockUserId, setBlockUserId] = useState(null);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/unblocked`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    }
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch degrees for filter
  useEffect(() => {
    if (filterType === 'degree') {
      axios.get(`${process.env.REACT_APP_API_URL}/degrees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(res => setDegreeOptions(res.data))
        .catch(() => setDegreeOptions([]));
    }
    if (filterType === 'batch') {
      axios.get(`${process.env.REACT_APP_API_URL}/degrees/all-batches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(res => setAllBatches(res.data))
        .catch(() => setAllBatches([]));
    }
  }, [filterType]);

  // Fetch specializations and batches for selected degrees
  useEffect(() => {
    if (filterType === 'degree') {
      selectedDegrees.forEach(degreeId => {
        // Fetch specializations
        if (!specializationOptions[degreeId]) {
          axios.get(`${process.env.REACT_APP_API_URL}/degrees/specializations/${degreeId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
            .then(res => {
              setSpecializationOptions(prev => ({ ...prev, [degreeId]: res.data }));
              // If no specializations, fetch batches for degree
              if (!res.data || res.data.length === 0) {
                axios.get(`${process.env.REACT_APP_API_URL}/degrees/batches/${degreeId}/null`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                })
                  .then(batchRes => setBatchOptions(prev => ({ ...prev, [degreeId]: batchRes.data })))
                  .catch(() => {});
              }
            })
            .catch(() => setSpecializationOptions(prev => ({ ...prev, [degreeId]: [] })));
        }
        // Fetch batches for selected specializations
        (specializationOptions[degreeId] || []).forEach(spec => {
          if (selectedSpecs.includes(spec._id) && !batchOptions[spec._id]) {
            axios.get(`${process.env.REACT_APP_API_URL}/degrees/batches/${degreeId}/${spec._id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
              .then(batchRes => setBatchOptions(prev => ({ ...prev, [spec._id]: batchRes.data })))
              .catch(() => {});
          }
        });
      });
    }
  }, [filterType, selectedDegrees, selectedSpecs, specializationOptions]);

  // 🔹 Handle Search + Filters + Sort
  useEffect(() => {
    let result = [...users];

    // Search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.userId.toLowerCase().includes(lower) ||
          u.name.toLowerCase().includes(lower) ||
          u.role.toLowerCase().includes(lower) ||
          (u.degree && u.degree.toLowerCase().includes(lower)) ||
          (u.specialization && u.specialization.toLowerCase().includes(lower)) ||
          (u.batch && u.batch.toLowerCase().includes(lower))
      );
    }

    // Advanced Filters
    if (filterType === 'role' && selectedRoles.length > 0) {
      result = result.filter(u => selectedRoles.includes(u.role));
    }
    if (filterType === 'degree' && selectedDegrees.length > 0) {
      result = result.filter(u => selectedDegrees.includes(u.degree));
    }
    if (filterType === 'batch' && selectedBatchIds.length > 0) {
      result = result.filter(u => {
        // u.batch is batchName, so match with selected batch names
        return selectedBatchIds.includes(u.batch);
      });
    }

    // Sort
    switch (sortOption) {
      case "role-asc":
        result.sort((a, b) => a.role.localeCompare(b.role));
        break;
      case "role-desc":
        result.sort((a, b) => b.role.localeCompare(a.role));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // latest (by createdAt if available, fallback to _id)
        result.sort((a, b) => (b.createdAt || b._id) > (a.createdAt || a._id) ? 1 : -1);
    }

    setFilteredUsers(result);
  }, [search, filterType, selectedRoles, selectedDegrees, selectedSpecs, selectedBatches, sortOption, users]);

  // 🔹 Handle Block User
  const handleBlock = async () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/block/${blockUserId}`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("User blocked successfully");
      setShowModal(false);
      setReason("");
      setBlockUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error blocking user");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className={`${Styles.card} rounded-xl space-y-4 transition-theme`}>
      <h3 className="text-xl font-semibold">Block Users</h3>

      {/* 🔍 Search + Sort + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by UID, Name, Role, Degree..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-1/3 bg-white text-black"
        />

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border rounded px-3 py-2 bg-white text-black">
          <option value="latest">Sort: Latest → Old</option>
          <option value="role-asc">Role: A → Z</option>
          <option value="role-desc">Role: Z → A</option>
          <option value="name-asc">Name: A → Z</option>
          <option value="name-desc">Name: Z → A</option>
        </select>
      </div>

      {/* Advanced Filters UI */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
          <label>Filter By:</label>
          <select value={filterType} onChange={e => {
            setFilterType(e.target.value);
            setSelectedRoles([]);
            setSelectedDegrees([]);
            setSelectedSpecs([]);
            setSelectedBatches([]);
            setSelectedBatchIds([]);
          }} className="border rounded px-2 py-1">
            <option value="role">Role</option>
            <option value="degree">Degree</option>
            <option value="batch">Batch</option>
          </select>
        </div>
        {filterType === 'role' && (
          <div className="flex flex-wrap gap-2">
            {roleOptions.map(role => (
              <label key={role} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={e => {
                    setSelectedRoles(prev => e.target.checked ? [...prev, role] : prev.filter(r => r !== role));
                  }}
                />
                {role}
              </label>
            ))}
          </div>
        )}
        {filterType === 'degree' && (
          <div className="flex flex-wrap gap-2">
            {degreeOptions.map(degree => (
              <label key={degree._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedDegrees.includes(degree.degree_name)}
                  onChange={e => {
                    setSelectedDegrees(prev => e.target.checked ? [...prev, degree.degree_name] : prev.filter(d => d !== degree.degree_name));
                  }}
                />
                {degree.degree_name}
              </label>
            ))}
          </div>
        )}
        {filterType === 'batch' && (
          <div className="flex flex-wrap gap-2">
            {allBatches.map(batch => (
              <label key={batch._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedBatchIds.includes(batch.batchName)}
                  onChange={e => {
                    setSelectedBatchIds(prev => e.target.checked ? [...prev, batch.batchName] : prev.filter(b => b !== batch.batchName));
                  }}
                />
                {batch.batchName}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className={theme === 'dark' ? "bg-gray-800 text-white" : theme === 'light' ? "bg-gray-200 text-gray-800" : "bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 text-white"}>
              <th className="border px-2 py-1">S.No</th>
              <th className="border px-2 py-1">UID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Degree</th>
              <th className="border px-2 py-1">Specialization</th>
              <th className="border px-2 py-1">Batch</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-2">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((u, i) => (
                <tr key={u._id} className="text-center">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{u.userId}</td>
                  <td className="border px-2 py-1">{u.name}</td>
                  <td className="border px-2 py-1">{u.role}</td>
                  <td className="border px-2 py-1">{u.degree || "-"}</td>
                  <td className="border px-2 py-1">{u.specialization || "-"}</td>
                  <td className="border px-2 py-1">{u.batch || "-"}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => { setBlockUserId(u._id); setShowModal(true); }}
                      className={`${Styles.button} bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded`}
                      disabled={loading}
                    >
                      {loading && blockUserId === u._id ? 'Blocking...' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Block Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className={theme === 'dark' ? "bg-gray-900 text-white p-6 rounded-xl w-96" : theme === 'light' ? "bg-white text-gray-900 p-6 rounded-xl w-96" : "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500 text-white p-6 rounded-xl w-96"}>
            <h4 className="text-lg font-semibold mb-3">Block User</h4>
            <textarea
              rows="3"
              placeholder="Enter reason for blocking"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-900"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowModal(false); setReason(""); }} className={`${Styles.button} border rounded`}>Cancel</button>
              <button onClick={handleBlock} className={`${Styles.button} bg-red-600 hover:bg-red-700 text-white`} disabled={loading}>
                {loading ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default BlockUsers;
