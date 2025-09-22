const mongoose = require('mongoose');
const AcademicYear = require('../../models/AcademicYear');
const Term = require('../../models/Term');
const Batch = require('../../models/Batch');
const User = require('../../models/User');
const Timetable = require('../../models/Timetable');

// constants
const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const PERIODS = [1,2,3,4,5,6,7,8]; // 8 periods / day

/**
 * Helper: initialize empty calendar maps:
 * - facultySlots[facultyId][day][period] = boolean
 * - sectionSlots[sectionId][day][period] = boolean
 */
function initSlotMap() {
  return DAYS.reduce((accD, d) => {
    accD[d] = PERIODS.reduce((accP, p) => (accP[p] = null, accP), {});
    return accD;
  }, {});
}

/**
 * generateTimetable (preview)
 * POST body: { academicYearId, schoolId, departmentId }
 *
 * Returns preview object:
 * {
 *  facultyEntries: [{ facultyId, facultyName, entries: [{day,period,subject,...}] }, ...],
 *  sections: [{ sectionId, sectionName, entries: [...] }, ...],
 *  unscheduled: [ ... ] // sessions that couldn't be placed
 * }
 */
exports.generateTimetable = async (req, res) => {
  try {
    const { academicYearId, schoolId, departmentId } = req.body;
    console.log("🔎 Incoming request:", { academicYearId, schoolId, departmentId });


    if (!academicYearId || !departmentId) return res.status(400).json({ message: "academicYearId & departmentId required" });

    
    // 1) Find batches for this department that are part of the academicYear
    const academicYear = await AcademicYear.findById(academicYearId).lean();
    if (!academicYear) return res.status(404).json({ message: "AcademicYear not found" });

    console.log("✅ AcademicYear found:", academicYear._id);

    // collect batch ids present in academicYear.programs matching departmentId
    const programBatches = new Set();
    (academicYear.programs || []).forEach(prog => {
      (prog.batches || []).forEach(bid => programBatches.add(bid.toString()));
    });

    // find batches under departmentId and within academicYear programs
    const batches = await Batch.find({
      _id: { $in: Array.from(programBatches).map(id => new mongoose.Types.ObjectId(id)) },
      departmentName: { $exists: true } // optional check
    }).lean();

    // Filter batches by departmentId (your Batch model may store department id vs name; adapt)
    // If your Batch has department_id field, use that instead:
    // const batches = await Batch.find({ _id: { $in: ...}, department_id: departmentId }).lean();

    // For reliability, try to include only those batches whose department matches requested departmentId:
    const filteredBatches = batches.filter(b => {
      if (b.department_id) return b.department_id.toString() === departmentId.toString();
      // fallback: match departmentName via dept collection (skipped)
      return true;
    });

    if (filteredBatches.length === 0) {
      return res.status(404).json({ message: "No batches found for this academic year & department" });
    }

    // 2) For each batch, find the current term(s) that belong to this academicYear+batch.
    // We'll fetch terms for the batches (all terms in DB that match academicYear and batch)
    const batchIds = filteredBatches.map(b => typeof b._id === 'string' ? new mongoose.Types.ObjectId(b._id) : b._id);
    const terms = await Term.find({ academicYear: academicYearId, batch_id: { $in: batchIds } }).lean();

    // Build list of sessions to schedule:
    // For each term -> for each subject -> for each facultyAssignment -> for each section assigned -> create sessions:
    // Each subject requires 5 sessions per week PER section (3 theory, 2 lab)
    const sessions = []; // { subjectId, subjectName, kind, facultyId, facultyName, batchId, sectionId, termId }

    for (const term of terms) {
      const batchId = term.batch_id.toString();
      for (const subj of (term.subjects || [])) {
        // subj.facultyAssignments: [{ faculty, sections: [sectionIds] }, ...]
        const subjectId = subj._id;
        const subjectName = subj.subjectName || subj.subjectName;
        // For each faculty assignment
        for (const fa of (subj.facultyAssignments || [])) {
          const facultyId = fa.faculty && fa.faculty.toString ? fa.faculty.toString() : fa.faculty;
          // ensure faculty doc exists
          const facultyDoc = await User.findById(facultyId).lean();
          const facultyName = facultyDoc ? facultyDoc.name : null;

          // sections array may be ObjectIds or strings
          const sectionsAssigned = (fa.sections || []).map(s => s.toString());

          // For each section, create sessions
          for (const secId of sectionsAssigned) {
            // create 3 theory + 2 lab sessions for this subject for that section
            for (let tcount = 0; tcount < 3; tcount++) {
              sessions.push({
                subjectId, subjectName, kind: 'theory',
                facultyId, facultyName,
                batchId, sectionId: secId, termId: term._id.toString()
              });
            }
            for (let lcount = 0; lcount < 2; lcount++) {
              sessions.push({
                subjectId, subjectName, kind: 'lab',
                facultyId, facultyName,
                batchId, sectionId: secId, termId: term._id.toString()
              });
            }
          }
        }
      }
    }

    // Shuffle sessions lightly to spread subjects (but keep deterministic order)
    // We will group by (section) so equal types are spread; do a sort that randomizes by subject+section hash
    sessions.sort((a, b) => {
      const aSection = a.sectionId.toString();
      const bSection = b.sectionId.toString();
      const aSubject = a.subjectId.toString();
      const bSubject = b.subjectId.toString();

      if (aSection !== bSection) return aSection.localeCompare(bSection);
      if (aSubject !== bSubject) return aSubject.localeCompare(bSubject);
      return a.kind.localeCompare(b.kind);
    });

    // 3) Prepare slot maps
    const facultySlots = {}; // facultyId -> slot map
    const sectionSlots = {}; // sectionId -> slot map

    // init slot maps for faculties and sections encountered
    const ensureFaculty = (fid) => {
      if (!facultySlots[fid]) facultySlots[fid] = initSlotMap();
    };
    const ensureSection = (sid) => {
      if (!sectionSlots[sid]) sectionSlots[sid] = initSlotMap();
    };

    sessions.forEach(s => { ensureFaculty(s.facultyId); ensureSection(s.sectionId); });

    // Keep scheduled entries to be returned grouped by faculty and by section
    const facultyEntriesMap = {}; // fid -> [{ day,period,subject...}]
    const sectionEntriesMap = {}; // sid -> [{...}]

    // helper: count subject occurrences per day per section to enforce spreading
    const subjectDayCount = {}; // key: `${sectionId}_${subjectId}_${day}` -> count

    const markAssigned = (session, day, period) => {
      // set slot to object
      facultySlots[session.facultyId][day][period] = session;
      sectionSlots[session.sectionId][day][period] = session;

      // add to maps
      if (!facultyEntriesMap[session.facultyId]) facultyEntriesMap[session.facultyId] = [];
      facultyEntriesMap[session.facultyId].push({
        day, period, subjectId: session.subjectId, subjectName: session.subjectName,
        facultyId: session.facultyId, facultyName: session.facultyName,
        batchId: session.batchId, sectionId: session.sectionId, kind: session.kind
      });

      if (!sectionEntriesMap[session.sectionId]) sectionEntriesMap[session.sectionId] = [];
      sectionEntriesMap[session.sectionId].push({
        day, period, subjectId: session.subjectId, subjectName: session.subjectName,
        facultyId: session.facultyId, facultyName: session.facultyName,
        batchId: session.batchId, sectionId: session.sectionId, kind: session.kind
      });

      // increment subjectDayCount
      const k = `${session.sectionId}_${session.subjectId}_${day}`;
      subjectDayCount[k] = (subjectDayCount[k] || 0) + 1;
    };

    // helper: checks if faculty and section free for (day,period)
    const isSlotFree = (facultyId, sectionId, day, period) => {
      if (facultySlots[facultyId][day][period]) return false;
      if (sectionSlots[sectionId][day][period]) return false;
      return true;
    };

    // helper: ensure we don't put more than 2 sessions of same subject on same day in a section
    const wouldExceedDailySubjectLimit = (sectionId, subjectId, day) => {
      const k = `${sectionId}_${subjectId}_${day}`;
      return (subjectDayCount[k] || 0) >= 2; // allow up to 2 per day for spread
    };

    // Scheduling strategy:
    // - Round over sessions; for each session, attempt to find a (day,period) that is free for both faculty and section.
    // - We attempt to spread across days: prefer days with least counts for that subject in that section.
    // - Also try to distribute periods so same subject not back-to-back in a day unless necessary.
    const unscheduled = [];

    for (const session of sessions) {
      const facultyId = session.facultyId;
      const sectionId = session.sectionId;

      ensureFaculty(facultyId);
      ensureSection(sectionId);

      // find candidate days sorted by current subjectDayCount ascending (prefer days with few of this subject)
      const dayOrder = [...DAYS].sort((a,b) => {
        const ca = subjectDayCount[`${sectionId}_${session.subjectId}_${a}`] || 0;
        const cb = subjectDayCount[`${sectionId}_${session.subjectId}_${b}`] || 0;
        return ca - cb;
      });

      let placed = false;

      // For each day in order, try periods. We'll use a period preference order to spread across day:
      // prefer middle periods first to avoid clustering at first/last if you want; here use natural order but skip if conflict
      for (const day of dayOrder) {
        if (wouldExceedDailySubjectLimit(sectionId, session.subjectId, day)) continue;

        // iterate periods but we prefer not to put more than 2 of same subject in same day
        for (const period of PERIODS) {
          // skip lunch? There is no lunch period index as lunch is between period4 and 5, so all periods valid.
          if (!isSlotFree(facultyId, sectionId, day, period)) continue;

          // Additional policy: avoid assigning same faculty multiple consecutive periods across multiple sections
          // (we allow faculty to have consecutive classes if free because they might move)
          // Try to enforce one same faculty slot per period; already enforced by facultySlots.

          // If slot good -> assign
          markAssigned(session, day, period);
          placed = true;
          break;
        }
        if (placed) break;
      }

      if (!placed) {
        // try a relaxed placement: allow placing even if faculty busy, but prefer not to (we will not do that).
        // Instead record unscheduled so admin can fix or increase free slots
        unscheduled.push(session);
      }
    }

    // Build preview object
    const facultyEntries = Object.keys(facultyEntriesMap).map(fid => ({
      facultyId: fid,
      facultyName: facultyEntriesMap[fid][0]?.facultyName || '',
      entries: facultyEntriesMap[fid]
    }));

    const sectionSchedules = Object.keys(sectionEntriesMap).map(sid => {
  let sectionName = '';
  for (const b of filteredBatches) {
    const sec = (b.sections || []).find(s => s._id.toString() === sid);
    if (sec) { sectionName = sec.sectionName; break; }
  }
  return {
    sectionId: sid,
    sectionName,
    entries: sectionEntriesMap[sid]
  };
});

    const preview = {
      generatedFor: { academicYearId, schoolId, departmentId },
      facultyEntries,
      sections: sectionSchedules,
      unscheduled
    };

    // return preview (not saved)
    res.json({ preview });

  } catch (err) {
    console.error("Error generating timetable:", err);
    return res.status(500).json({ message: "Failed to generate timetable", error: err.message });
  }
};


/**
 * publishTimetable
 * - Accepts the preview object (or recomputes) and saves to DB
 * POST body: { preview }
 */
exports.publishTimetable = async (req, res) => {
  try {
    const { preview } = req.body;
    if (!preview) return res.status(400).json({ message: "Preview required" });

    // minimal validation
    const { generatedFor, facultyEntries, sections } = preview;
    if (!generatedFor || !generatedFor.academicYearId || !generatedFor.departmentId) {
      return res.status(400).json({ message: "Invalid preview metadata" });
    }

    const timetableDoc = new Timetable({
      academicYearId: generatedFor.academicYearId,
      schoolId: generatedFor.schoolId || null,
      departmentId: generatedFor.departmentId,
      generatedBy: req.user ? req.user.id : null,
      facultySchedules: (facultyEntries || []).map(f => ({
        facultyId: f.facultyId,
        facultyName: f.facultyName,
        entries: f.entries
      })),
      sectionSchedules: (sections || []).map(s => ({
        batchId: s.batchId || null,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        entries: s.entries
      })),
      meta: preview.meta || {}
    });

    await timetableDoc.save();
    res.status(201).json({ message: "Timetable published", timetableId: timetableDoc._id });

  } catch (err) {
    console.error("Error publishing timetable:", err);
    res.status(500).json({ message: "Failed to publish timetable", error: err.message });
  }
};
