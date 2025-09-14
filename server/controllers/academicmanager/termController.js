const Term = require("../../models/Term");
const AcademicYear = require("../../models/AcademicYear");

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
