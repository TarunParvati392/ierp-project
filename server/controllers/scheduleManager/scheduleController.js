const mongoose = require('mongoose');
const Term = require('../../models/Term');
const Batch = require('../../models/Batch');
const Timetable = require('../../models/Timetable');
const User = require('../../models/User');

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const PERIODS = [1,2,3,4,5,6,7,8]; // 8 periods per day

// Helper: produce full slot list
const buildAllSlots = () => {
  const slots = [];
  for (const day of DAYS) {
    for (const p of PERIODS) {
      slots.push({ day, period: p });
    }
  }
  return slots; // length = 40
};

// Helper: check if faculty is free in slot
const isFacultyFree = (assignmentsBySlot, slotKey, facultyId) => {
  const assigned = assignmentsBySlot[slotKey];
  if (!assigned) return true;
  // assigned is array of objects with faculty and section
  return !assigned.some(a => a.faculty && a.faculty.toString() === facultyId.toString());
};

// Helper: check if section is free in slot
const isSectionFree = (assignmentsBySlot, slotKey, sectionId) => {
  const assigned = assignmentsBySlot[slotKey];
  if (!assigned) return true;
  return !assigned.some(a => a.section && a.section.toString() === sectionId.toString());
};

// Convert slot to key
const slotKey = (s) => `${s.day}_${s.period}`;

// Utility: sort slots to encourage spreading across days (heuristic)
const orderSlotsForTask = (allSlots, existingAssignedForSection) => {
  // prefer slots on different days if section already has assignments
  const usedDays = new Set(existingAssignedForSection.map(a => a.day));
  const prioritized = [];
  const others = [];
  for (const s of allSlots) {
    if (!usedDays.has(s.day)) prioritized.push(s);
    else others.push(s);
  }
  return [...prioritized, ...others];
};

exports.generateTimetable = async (req, res) => {
  try {
    const { academicYear, department_id, termId, batchId } = req.body;
    if (!academicYear || !department_id || !termId || !batchId) {
      return res.status(400).json({ message: "academicYear, department_id, termId, batchId required" });
    }

    // Load term (with subjects & faculty assignments)
    const term = await Term.findById(termId)
      .populate('subjects.facultyAssignments.faculty', 'name email')
      .lean();
    if (!term) return res.status(404).json({ message: "Term not found" });

    // Load batch (sections)
    const batch = await Batch.findById(batchId).lean();
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const allSlots = buildAllSlots(); // 40 slots

    // Build tasks: each task = one slot needed for a subject for a particular section and a particular kind (theory/lab)
    // For each subject, for each facultyAssignment, for each section in that assignment: create 5 tasks (3 theory, 2 lab)
    const tasks = []; // { id, subjectId, subjectName, subjectCode, facultyId, facultyName, sectionId, kind }
    for (const subj of term.subjects) {
      const subjectId = subj._id;
      const subjectName = subj.subjectName;
      const subjectCode = subj.subjectCode;

      // If a subject has zero facultyAssignments, that's an error — cannot schedule
      if (!subj.facultyAssignments || subj.facultyAssignments.length === 0) {
        return res.status(400).json({ message: `Subject ${subjectName} has no faculty assignments. Assign faculty before generating timetable.` });
      }

      for (const fa of subj.facultyAssignments) {
        const facultyId = fa.faculty ? fa.faculty._id : fa.faculty;
        const facultyName = fa.faculty ? (fa.faculty.name || fa.faculty.email) : 'Unknown';

        if (!fa.sections || fa.sections.length === 0) {
          return res.status(400).json({ message: `Faculty assignment for subject ${subjectName} has no sections.` });
        }

        for (const secId of fa.sections) {
          // ensure secId exists in batch
          const secExists = batch.sections.some(s => s._id.toString() === secId.toString());
          if (!secExists) {
            return res.status(400).json({ message: `Section ${secId} (assigned in subject ${subjectName}) not found in batch` });
          }

          // push 3 theory tasks and 2 lab tasks for this (subject, section, faculty)
          for (let i=0;i<3;i++) tasks.push({
            id: mongoose.Types.ObjectId().toString(),
            subjectId, subjectName, subjectCode, facultyId, facultyName,
            sectionId: secId, kind: 'theory'
          });
          for (let i=0;i<2;i++) tasks.push({
            id: mongoose.Types.ObjectId().toString(),
            subjectId, subjectName, subjectCode, facultyId, facultyName,
            sectionId: secId, kind: 'lab'
          });
        }
      }
    }

    // Quick feasibility check: total required slots <= total available slots per batch
    const totalRequired = tasks.length;
    const totalAvailable = allSlots.length * batch.sections.length; // slots * sections
    if (totalRequired > totalAvailable) {
      return res.status(400).json({ message: `Not enough total slots. Required ${totalRequired}, available ${totalAvailable}. Reduce subjects/sections or add free slots policy.` });
    }

    // Data structures for backtracking
    // assignmentsBySlot: slotKey -> array of { faculty, section, subjectId, kind, subjectName, subjectCode }
    const assignmentsBySlot = {};
    // To speed up constraints, maintain maps:
    // facultyAssignmentsCount: facultyId -> number of slots assigned (not strictly required but helpful)
    const facultyAssignments = {};
    // sectionAssignments: sectionId -> array of assigned slot objects (for spread heuristics)
    const sectionAssignments = {};
    for (const sec of batch.sections) sectionAssignments[sec._id.toString()] = [];

    // Order tasks by heuristic: tasks with fewer candidate slots should be placed first (MRV).
    // We will compute candidate slots dynamically inside the recursion to be accurate.
    const allSlotsCopy = allSlots.map(s => ({...s}));

    // Convert to helper arrays for recursion
    const tasksArr = tasks;

    // Helper to compute candidate slots for a task given current assignments
    const computeCandidateSlots = (task) => {
      // candidate slots = allSlots where both faculty & section free
      // Additional heuristic: try to spread across days, so order by days not used by section
      const existingForSection = sectionAssignments[task.sectionId.toString()] || [];
      const ordered = orderSlotsForTask(allSlotsCopy, existingForSection);

      const candidates = [];
      for (const s of ordered) {
        const key = slotKey(s);
        if (!isFacultyFree(assignmentsBySlot, key, task.facultyId)) continue;
        if (!isSectionFree(assignmentsBySlot, key, task.sectionId)) continue;

        // optionally, avoid assigning same subject multiple times in same day for the section (spread)
        const assignedThisDayForSection = existingForSection.some(a => a.day === s.day && a.subjectId && a.subjectId.toString() === task.subjectId.toString());
        if (assignedThisDayForSection) {
          // prefer to avoid but don't forbid — place later in list (we can still include)
          candidates.push({ slot: s, penalty: 1 });
        } else {
          candidates.push({ slot: s, penalty: 0 });
        }
      }
      // sort by penalty then period maybe
      candidates.sort((a,b) => a.penalty - b.penalty || a.slot.period - b.slot.period);
      return candidates.map(c=>c.slot);
    };

    // Use recursion with MRV ordering (choose task with fewest candidates)
    const assignedResults = []; // array of { day, period, section, faculty,... }

    // Precompute a map to group tasks by (section) to get existingForSection usage working quickly
    const recursion = (remainingTasks) => {
      if (remainingTasks.length === 0) return true;

      // MRV: compute candidate counts
      let bestIdx = -1;
      let bestCandidates = null;
      let bestCount = Infinity;

      for (let i = 0; i < remainingTasks.length; i++) {
        const t = remainingTasks[i];
        const candidates = computeCandidateSlots(t);
        if (candidates.length === 0) {
          // impossible branch
          return false;
        }
        if (candidates.length < bestCount) {
          bestCount = candidates.length;
          bestIdx = i;
          bestCandidates = candidates;
          if (bestCount === 1) break; // can't do better
        }
      }

      // pick task
      const task = remainingTasks[bestIdx];

      // iterate over candidate slots in order (heuristic)
      for (const s of bestCandidates) {
        const key = slotKey(s);

        // assign
        if (!assignmentsBySlot[key]) assignmentsBySlot[key] = [];
        assignmentsBySlot[key].push({
          faculty: task.facultyId, section: task.sectionId,
          subjectId: task.subjectId, kind: task.kind,
          subjectName: task.subjectName, subjectCode: task.subjectCode
        });

        facultyAssignments[task.facultyId] = (facultyAssignments[task.facultyId] || 0) + 1;
        sectionAssignments[task.sectionId.toString()].push({ day: s.day, period: s.period, subjectId: task.subjectId });

        // record in assignedResults (for building entries later)
        assignedResults.push({
          day: s.day, period: s.period,
          section: task.sectionId, faculty: task.facultyId,
          subjectId: task.subjectId, kind: task.kind,
          subjectName: task.subjectName, subjectCode: task.subjectCode
        });

        // recurse with remaining - remove this task
        const nextTasks = remainingTasks.slice(0, bestIdx).concat(remainingTasks.slice(bestIdx+1));
        const ok = recursion(nextTasks);
        if (ok) return true;

        // backtrack
        assignmentsBySlot[key].pop();
        if (assignmentsBySlot[key].length === 0) delete assignmentsBySlot[key];
        facultyAssignments[task.facultyId] -= 1;
        // remove last section assignment matching this day & period
        const arr = sectionAssignments[task.sectionId.toString()];
        for (let j = arr.length - 1; j >= 0; j--) {
          const el = arr[j];
          if (el.day === s.day && el.period === s.period && el.subjectId.toString() === task.subjectId.toString()) {
            arr.splice(j, 1);
            break;
          }
        }
        // remove from assignedResults
        assignedResults.pop();
      }

      // none candidate worked
      return false;
    };

    const ok = recursion(tasksArr);
    if (!ok) {
      return res.status(500).json({ message: "Failed to generate timetable without conflicts. Try reducing assignments or allow more free slots." });
    }

    // Build entries array from assignedResults: map section ids to sectionName
    const sectionMap = {};
    for (const s of batch.sections) sectionMap[s._id.toString()] = s.sectionName;

    const entries = assignedResults.map(a => ({
      day: a.day,
      period: a.period,
      section: a.section,
      sectionName: sectionMap[a.section.toString()] || null,
      subject_id: a.subjectId,
      subjectName: a.subjectName,
      subjectCode: a.subjectCode,
      faculty: a.faculty,
      facultyName: a.facultyName,
      kind: a.kind,
      room: null
    }));

    // return preview (not saved). Client can publish by calling publish endpoint with returned entries.
    return res.json({ message: "Timetable generated (preview)", preview: { academicYear, department_id, termId, batchId, entries } });

  } catch (err) {
    console.error("Error generating timetable:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Step B: Publish
exports.publishTimetable = async (req, res) => {
  try {
    const { academicYear, department_id, termId, batchId, entries } = req.body;
    if (!academicYear || !department_id || !termId || !batchId || !entries) {
      return res.status(400).json({ message: "Missing inputs" });
    }

    // Mark old timetables as unpublished
    await Timetable.updateMany(
      { academicYear, department_id, term_id: termId, batch_id: batchId, published: true },
      { $set: { published: false } }
    );

    // Save new timetable
    const latest = await Timetable.findOne({ academicYear, department_id, term_id: termId, batch_id: batchId })
      .sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    const newTT = new Timetable({
      academicYear, department_id, term_id: termId, batch_id: batchId,
      generatedBy: req.user.id,
      published: true,
      version,
      entries
    });

    await newTT.save();
    res.status(201).json({ message: "Timetable published successfully", timetable: newTT });
  } catch (err) {
    console.error("Error publishing timetable:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Step C: Get latest timetable
exports.getLatestTimetable = async (req, res) => {
  try {
    const { batchId, termId } = req.query;
    if (!batchId || !termId) return res.status(400).json({ message: "Batch & Term required" });

    const latest = await Timetable.findOne({ batch_id: batchId, term_id: termId, published: true })
      .populate("entries.faculty", "name email")
      .populate("entries.section", "sectionName")
      .lean();

    res.json(latest || { message: "No published timetable found" });
  } catch (err) {
    console.error("Error fetching latest timetable:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
