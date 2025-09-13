const mongoose = require("mongoose");
const AcademicYear = require("../../models/AcademicYear");
const Degree = mongoose.connection.collection("degrees");
const Specialization = mongoose.connection.collection("specializations");
const Batch = mongoose.connection.collection("batches");

// ✅ Create Academic Year
exports.createAcademicYear = async (req, res) => {
  try {
    const { academicYear,  programs } = req.body;

    if (!academicYear || !programs || programs.length === 0) {
      return res.status(400).json({ message: "Academic Year and at least one program are required" });
    }

    // Check duplicate academicYear
    const existingYear = await AcademicYear.findOne({ academicYear });
    if (existingYear) {
      return res.status(400).json({ message: "Academic Year already exists" });
    }

    // 🔹 Clean input (avoid empty string ObjectId errors)
    programs.forEach(p => {
      if (!p.specialization_id || p.specialization_id === "") {
        p.specialization_id = null;
      }
    });

    // Validate each program
    for (const program of programs) {
      // Degree is mandatory
      if (!program.degree_id) {
        return res.status(400).json({ message: "Degree is required for each program" });
      }
      // Batch is mandatory (single batch_id or array of batch_ids)
      if (!program.batch_id && (!program.batches || program.batches.length === 0)) {
        return res.status(400).json({ message: "Batch is required for each program" });
      }

      const degree = await Degree.findOne({ _id: new mongoose.Types.ObjectId(program.degree_id) });
      if (!degree) {
        return res.status(404).json({ message: `Degree not found for ${program.degree_id}` });
      }

      // Specialization is optional, but if present, must be linked to degree
      if (program.specialization_id) {
        const spec = await Specialization.findOne({
          _id: new mongoose.Types.ObjectId(program.specialization_id),
          degree_id: new mongoose.Types.ObjectId(program.degree_id),
        });
        if (!spec) {
          return res.status(404).json({ message: "Specialization not found or not linked to this degree" });
        }
      }

      // Support both batch_id (single) and batches (array)
      let batchIds = [];
      if (program.batch_id) batchIds = [program.batch_id];
      if (program.batches && Array.isArray(program.batches)) batchIds = program.batches;
      if (!batchIds.length) {
        return res.status(400).json({ message: "Batch is required for each program" });
      }
      const batchDocs = await Batch.find({
        _id: { $in: batchIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).toArray();
      if (batchDocs.length !== batchIds.length) {
        return res.status(404).json({ message: "One or more batches not found" });
      }
    }

    // Save (academicYear and programs only; dates are per-program)
    const newYear = new AcademicYear({
      academicYear,
      programs,
    });

    await newYear.save();

    res.status(201).json({ message: "Academic Year created successfully", academicYear: newYear });
  } catch (err) {
    console.error("Error creating academic year:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get All Academic Years with populated names
exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find({})
      .populate("programs.degree_id", "degree_name")
      .populate("programs.specialization_id", "specialization_name")
      .populate("programs.batches", "batchName");

    res.json(years);
  } catch (err) {
    console.error("Error fetching academic years:", err);
    res.status(500).json({ message: "Server error" });
  }
};
