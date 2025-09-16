import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";

/**
 * AssignFacultyPage
 * - Uses your ThemeContext + getThemeStyles
 * - See API expectations in the message above
 */

const AssignSubject = () => {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);

  // selectors
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [termsForBatch, setTermsForBatch] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  // term + subjects data
  const [termData, setTermData] = useState(null); // GET /terms/:termId populated

  // faculty list & workload
  const [faculties, setFaculties] = useState([]);
  const [facultyWorkloadCache, setFacultyWorkloadCache] = useState({}); // facultyId -> { subjectsCount, sectionsCount }

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSubject, setModalSubject] = useState(null); // subject object
  const [modalFaculty, setModalFaculty] = useState("");
  const [modalSelectedSections, setModalSelectedSections] = useState([]);

  // loading
  const [loading, setLoading] = useState(false);

  // base headers
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});

  // --- Initial: load academic years + faculties ---
  useEffect(() => {
    (async () => {
      try {
        const [yearsRes, facultyRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/academic-years`, authHeaders()),
          axios.get(`${process.env.REACT_APP_API_URL}/staff/faculty`, authHeaders()), // expected endpoint
        ]);
        setYears(yearsRes.data || []);
        setFaculties(facultyRes.data || []);
      } catch (err) {
        console.error("Init load error:", err);
        toast.error("Failed loading initial data");
      }
    })();
  }, []);

  // --- when year changes, set programs ---
  useEffect(() => {
    if (!selectedYear) {
      setPrograms([]);
      setSelectedProgram("");
      return;
    }
    const year = years.find(y => y._id === selectedYear);
    const progs = year?.programs || [];
    setPrograms(progs);
    setSelectedProgram("");
    setBatches([]);
    setSelectedBatch("");
    setTermsForBatch([]);
    setSelectedTerm("");
    setTermData(null);
  }, [selectedYear, years]);

  // --- when program changes, set batches ---
  useEffect(() => {
    if (!selectedProgram) {
      setBatches([]);
      setSelectedBatch("");
      return;
    }
    const prog = programs.find(p => p._id === selectedProgram);
    setBatches(prog?.batches || []);
    setSelectedBatch("");
    setTermsForBatch([]);
    setSelectedTerm("");
    setTermData(null);
  }, [selectedProgram, programs]);

  // --- when batch changes, load terms for that batch ---
  useEffect(() => {
    const loadTermsForBatch = async () => {
      if (!selectedBatch) {
        setTermsForBatch([]);
        setSelectedTerm("");
        return;
      }
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/terms/by-batch/${selectedBatch}`, authHeaders());
        setTermsForBatch(res.data || []);
        setSelectedTerm("");
        setTermData(null);
      } catch (err) {
        console.error("Error loading terms:", err);
        setTermsForBatch([]);
        toast.error("Failed to load terms for this batch");
      }
    };
    loadTermsForBatch();
  }, [selectedBatch]);

  // --- when term changes, load populated term details ---
  useEffect(() => {
    const loadTerm = async () => {
      if (!selectedTerm) {
        setTermData(null);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/terms/${selectedTerm}`, authHeaders());
        setTermData(res.data);
      } catch (err) {
        console.error("Error loading term data:", err);
        toast.error("Failed to load term details");
        setTermData(null);
      } finally {
        setLoading(false);
      }
    };
    loadTerm();
  }, [selectedTerm]);

  // --- helper: open modal for a subject ---
  const openAssignModal = (subject) => {
    setModalSubject(subject);
    setModalFaculty("");
    setModalSelectedSections([]);
    setShowModal(true);
  };

  // --- helper: close modal ---
  const closeModal = () => {
    setShowModal(false);
    setModalSubject(null);
    setModalFaculty("");
    setModalSelectedSections([]);
  };

  // --- get sections list for the batch (section docs) ---
  const batchSections = (termData?.batch_id?.sections) || (termData?.batch_id && termData.batch_id.sections) || [];
  // however if batch sections are not nested, fallback to batchSections from termData.batch_id.sections
  // UI expects section objects: { _id, sectionName }

  // --- compute which sectionIds are already assigned for this subject (to disable those checkboxes) ---
  const assignedSectionIdsForSubject = (subject) => {
    if (!subject?.facultyAssignments) return [];
    const assigned = new Set();
    subject.facultyAssignments.forEach(fa => {
      (fa.sections || []).forEach(sec => {
        // section could be populated as object or as id
        assigned.add(typeof sec === "object" ? sec._id : sec.toString());
      });
    });
    return Array.from(assigned);
  };

  // --- fetch workload for a faculty (cache result) ---
  const fetchFacultyWorkload = async (facultyId) => {
    if (!facultyId) return null;
    if (facultyWorkloadCache[facultyId]) return facultyWorkloadCache[facultyId];
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/faculty/${facultyId}/assignments`, authHeaders());
      const data = res.data || {};
      setFacultyWorkloadCache(prev => ({ ...prev, [facultyId]: data }));
      return data;
    } catch (err) {
      // If endpoint doesn't exist or errors, just return null — backend will enforce rules
      console.warn("Workload fetch failed/absent:", err?.response?.status);
      return null;
    }
  };

  // --- when faculty selected in modal, attempt to fetch their workload ---
  useEffect(() => {
    if (!modalFaculty) return;
    fetchFacultyWorkload(modalFaculty);
  }, [modalFaculty]);

  // --- toggle section selection in modal ---
  const toggleSectionSelection = (sectionId) => {
    setModalSelectedSections(prev => {
      if (prev.includes(sectionId)) return prev.filter(s => s !== sectionId);
      return [...prev, sectionId];
    });
  };

  // --- Save assignment ---
  const handleSaveAssignment = async () => {
    if (!modalSubject || !modalFaculty || modalSelectedSections.length === 0) {
      toast.error("Select faculty and at least one section");
      return;
    }

    // client-side validation if workload available
    const wl = facultyWorkloadCache[modalFaculty] || null;
    if (wl) {
      // subjectsCount - how many distinct subjects faculty already teaches
      const subjCount = wl.subjectsCount ?? 0;
      const secCount = wl.sectionsCount ?? 0;

      // if faculty already teaches this subject (subject could be present in wl subject list) we should consider whether it's same subject or new
      // backend has correct logic; here we do a conservative check
      const addingWouldExceedSubjects = subjCount >= 2 && !wl.currentSubjectIds?.includes(modalSubject._id);
      if (addingWouldExceedSubjects) {
        toast.error("Faculty already assigned to 2 different subjects");
        return;
      }
      if ((secCount + modalSelectedSections.length) > 3) {
        toast.error("Faculty cannot exceed 3 sections overall");
        return;
      }
    }

    // Also disallow selecting sections already assigned for this subject (defensive)
    const assignedIds = assignedSectionIdsForSubject(modalSubject);
    const overlap = modalSelectedSections.some(sid => assignedIds.includes(sid));
    if (overlap) {
      toast.error("One or more selected sections are already assigned for this subject");
      return;
    }

    // call backend
    try {
      setLoading(true);
      const payload = { faculty: modalFaculty, sections: modalSelectedSections };
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/faculty-assignment/${selectedTerm}/subjects/${modalSubject._id}/assign-faculty`,
        payload,
        authHeaders()
      );
      toast.success(res.data?.message || "Faculty assigned");

      // refresh term data
      const fresh = await axios.get(`${process.env.REACT_APP_API_URL}/terms/${selectedTerm}`, authHeaders());
      setTermData(fresh.data);
      closeModal();
    } catch (err) {
      console.error("Assign failed:", err);
      const msg = err?.response?.data?.message || "Assign failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- UI helpers ---
  const renderSubjectCard = (subject) => {
    const assignedList = subject.facultyAssignments || [];
    return (
      <div key={subject._id} className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold">{subject.subjectName} <span className="text-sm text-gray-500">({subject.subjectCode})</span></div>
            <div className="mt-2">
              {assignedList.length === 0 ? (
                <div className="text-sm text-gray-600">No faculty assigned yet</div>
              ) : (
                assignedList.map((fa, idx) => {
                  const fname = fa.faculty ? fa.faculty.name || fa.faculty.email : "Unknown";
                  const fsections = (fa.sections || []).map(s => (typeof s === "object" ? s.sectionName : s));
                  return (
                    <div key={idx} className="text-sm">
                      <b>{fname}</b> → {fsections.join(", ")}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => openAssignModal(subject)}
              className={`${Styles.button} bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded`}
            >
              Assign Faculty
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${Styles.card} p-4 rounded-xl`}>
      <h3 className="text-xl font-semibold mb-4">Assign Faculty to Subjects</h3>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <select className="border rounded px-3 py-2" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="">-- Academic Year --</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.academicYear}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} disabled={!selectedYear}>
          <option value="">-- Program --</option>
          {programs.map(p => <option key={p._id} value={p._id}>{p.degree_id?.degree_name}{p.specialization_id ? ` - ${p.specialization_id.specialization_name}` : ""}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={!selectedProgram}>
          <option value="">-- Batch --</option>
          {batches.map(b => <option key={b._id} value={b._id}>{b.batchName || b.batch_name}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} disabled={!selectedBatch}>
          <option value="">-- Term --</option>
          {termsForBatch.map(t => <option key={t._id} value={t._id}>{t.termName}</option>)}
        </select>
      </div>

      {/* Term subjects */}
      {loading && <div className="mb-3 text-sm text-gray-600">Loading...</div>}
      {!selectedTerm && <div className="text-sm text-gray-500">Choose an Academic Year → Program → Batch → Term to view subjects.</div>}

      {termData && (
        <div>
          <div className="mb-3 text-sm text-gray-700">
            <b>Batch:</b> {termData.batch_id?.batchName || (termData.batch_id?.batchName ?? "-")}
          </div>

          <div>
            {termData.subjects && termData.subjects.length > 0 ? (
              termData.subjects.map(renderSubjectCard)
            ) : (
              <div className="text-sm text-gray-600">No subjects found for this term.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && modalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Assign Faculty — {modalSubject.subjectName}</h4>
              <button onClick={closeModal} className="text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Select Faculty</label>
                <select value={modalFaculty} onChange={e => setModalFaculty(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
                </select>
                {/* workload hint */}
                {modalFaculty && facultyWorkloadCache[modalFaculty] && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div>Assigned Subjects: {facultyWorkloadCache[modalFaculty].subjectsCount}</div>
                    <div>Assigned Sections: {facultyWorkloadCache[modalFaculty].sectionsCount}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Select Sections</label>
                <div className="max-h-40 overflow-auto border rounded p-2 bg-gray-50">
                  {batchSections.length === 0 && <div className="text-sm text-gray-500">No sections found for this batch</div>}
                  {batchSections.map(sec => {
                    const sid = sec._id || sec._id; // safe
                    const assignedIds = assignedSectionIdsForSubject(modalSubject);
                    const alreadyAssigned = assignedIds.includes(sid.toString());
                    const checked = modalSelectedSections.includes(sid.toString());
                    return (
                      <div key={sid} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          disabled={alreadyAssigned}
                          checked={checked}
                          onChange={() => toggleSectionSelection(sid.toString())}
                        />
                        <span className={`${alreadyAssigned ? "text-gray-400 line-through" : ""}`}>{sec.sectionName}</span>
                        {alreadyAssigned && <span className="ml-2 text-xs text-red-500">(already assigned)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeModal} className={`${Styles.button} border`}>Cancel</button>
              <button onClick={handleSaveAssignment} className={`${Styles.button} bg-green-600 text-white`} disabled={loading}>
                {loading ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignSubject;
