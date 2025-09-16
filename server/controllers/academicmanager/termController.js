const Term = require("../../models/Term");
const AcademicYear = require("../../models/AcademicYear");
const User = require("../../models/User"); // Assuming faculty are Users with role "Faculty"

// ✅ Create Term
exports.createTerm = async (req, res) => {
  try {
    const { termName, academicYear, program_id, batch_id, subjects } = req.body;

    if (!termName) return res.status(400).json({ message: "Term Name is required" });
    if (!academicYear) return res.status(400).json({ message: "Academic Year is required" });
    if (!program_id) return res.status(400).json({ message: "Program is required" });
    if (!batch_id) return res.status(400).json({ message: "Batch is required" });
    if (!subjects || subjects.length === 0) return res.status(400).json({ message: "At least one subject is required" });

    // Check for duplicate subject names or codes in the same term
    const subjectNames = subjects.map(s => s.subjectName?.trim().toLowerCase()).filter(Boolean);
    const subjectCodes = subjects.map(s => s.subjectCode?.trim().toLowerCase()).filter(Boolean);
    const nameSet = new Set();
    const codeSet = new Set();
    for (let i = 0; i < subjects.length; i++) {
      const name = subjectNames[i];
      const code = subjectCodes[i];
      if (nameSet.has(name)) {
        return res.status(400).json({ message: `Duplicate subject name found: '${subjects[i].subjectName}'` });
      }
      if (codeSet.has(code)) {
        return res.status(400).json({ message: `Duplicate subject code found: '${subjects[i].subjectCode}'` });
      }
      nameSet.add(name);
      codeSet.add(code);
    }

    // Check duplicate term for the same program in the same academic year
    const exists = await Term.findOne({ termName, academicYear, program_id, batch_id });
    if (exists) {
      return res.status(400).json({ message: "This term already exists for the selected academic year, program, and batch" });
    }

    const newTerm = new Term({ termName, academicYear, program_id, batch_id, subjects });
    await newTerm.save();

    res.status(201).json({ message: "Term created successfully", term: newTerm });
  } catch (err) {
    console.error("Error creating term:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// 🔹 Get all terms for a given batch
exports.getTermsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) return res.status(400).json({ message: "Batch ID is required" });

    const terms = await Term.find({ batch_id: batchId })
      .select("_id termName academicYear program_id batch_id") // keep it light
      .populate("academicYear", "academicYear")
      .populate("program_id", "degree_id specialization_id")
      .populate("batch_id", "batchName");

    res.json(terms);
  } catch (err) {
    console.error("Error fetching terms by batch:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// ✅ Assign Faculty to Subject + Sections
exports.assignFacultyToSubject = async (req, res) => {
  try {
    const { termId, subjectId } = req.params;
    const { faculty, sections } = req.body;

    if (!faculty || !sections || sections.length === 0) {
      return res.status(400).json({ message: "Faculty and at least one section are required" });
    }

    // Check faculty exists and is actually a faculty
    const facultyDoc = await User.findOne({ _id: faculty, role: "Faculty" });
    if (!facultyDoc) {
      return res.status(404).json({ message: "Faculty not found or not a faculty" });
    }

    // Fetch term and subject
    const term = await Term.findById(termId).populate("subjects.facultyAssignments.faculty", "name");
    if (!term) return res.status(404).json({ message: "Term not found" });

    const subject = term.subjects.id(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // ✅ Validation Rules
    // 1. Faculty can’t exceed 2 subjects total
    const facultyAssignments = await Term.aggregate([
      { $unwind: "$subjects" },
      { $unwind: "$subjects.facultyAssignments" },
      { $match: { "subjects.facultyAssignments.faculty": new mongoose.Types.ObjectId(faculty) } },
      { $group: { _id: "$subjects.subjectCode" } }
    ]);

    if (facultyAssignments.length >= 2 && !facultyAssignments.some(f => f._id === subject.subjectCode)) {
      return res.status(400).json({ message: "Faculty already assigned to 2 different subjects" });
    }

    // 2. Faculty can’t exceed 3 sections overall
    const sectionAssignments = await Term.aggregate([
      { $unwind: "$subjects" },
      { $unwind: "$subjects.facultyAssignments" },
      { $match: { "subjects.facultyAssignments.faculty": new mongoose.Types.ObjectId(faculty) } },
      { $unwind: "$subjects.facultyAssignments.sections" },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    const totalSections = sectionAssignments.length > 0 ? sectionAssignments[0].total : 0;
    if (totalSections + sections.length > 3) {
      return res.status(400).json({ message: "Faculty cannot be assigned more than 3 sections overall" });
    }

    // ✅ Add / Update Assignment
    let assignment = subject.facultyAssignments.find(fa => fa.faculty.toString() === faculty);
    if (assignment) {
      // Merge new sections (no duplicates)
      const newSections = [...new Set([...assignment.sections.map(s => s.toString()), ...sections])];
      if (newSections.length > 3) {
        return res.status(400).json({ message: "Faculty cannot exceed 3 sections for this subject" });
      }
      assignment.sections = newSections;
    } else {
      subject.facultyAssignments.push({ faculty, sections });
    }

    await term.save();
    res.status(200).json({ message: "Faculty assigned successfully", subject });
  } catch (err) {
    console.error("Error assigning faculty:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTermWithAssignments = async (req, res) => {
  try {
    const { termId } = req.params;

    const term = await Term.findById(termId)
      .populate("academicYear", "academicYear")
      .populate("program_id", "degree_id specialization_id")
      .populate({
        path: "batch_id",
        select: "batchName sections",
      })
      .populate("subjects.facultyAssignments.faculty", "name email"); // faculty details

    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }

    // Attach section details from batch.sections for each assignment
    const batchSections = (term.batch_id && term.batch_id.sections) || [];
    const sectionMap = {};
    batchSections.forEach(sec => {
      sectionMap[sec._id.toString()] = sec;
    });
    // For each subject, for each facultyAssignment, replace section IDs with section objects
    term.subjects.forEach(subj => {
      subj.facultyAssignments.forEach(fa => {
        if (fa.sections && Array.isArray(fa.sections)) {
          fa.sections = fa.sections.map(secId => {
            if (typeof secId === 'object' && secId._id) return secId; // already populated
            return sectionMap[secId.toString()] || secId;
          });
        }
      });
    });

    res.json(term);
  } catch (err) {
    console.error("Error fetching term:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
