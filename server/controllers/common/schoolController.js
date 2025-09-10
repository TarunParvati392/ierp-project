const mongoose = require('mongoose');

const School = mongoose.connection.collection("schools");
const Department = mongoose.connection.collection("departments");

//Get All Schools
exports.getSchools = async (req, res) =>{
    try{
        const schools = await School.find({}).toArray();
        res.json(schools);
    } catch (err){
        console.error("Error fetching schools:", err);
        res.status(500).json({ error: 'Error Fetching Schools' });
    }
};

//Get Departments By School
exports.getDepartmentsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Find all degrees for this school
    const degrees = await mongoose.connection
      .collection("degrees")
      .find({ school_id: new mongoose.Types.ObjectId(schoolId) })
      .toArray();

    if (!degrees.length) {
      return res.json([]);
    }

    const degreeIds = degrees.map((d) => d._id);

    // Find all specializations for these degrees
    const specializations = await mongoose.connection
      .collection("specializations")
      .find({ degree_id: { $in: degreeIds } })
      .toArray();

    const specializationIds = specializations.map((s) => s._id);

    // Find departments linked to either degree or specialization
    const departments = await mongoose.connection
      .collection("departments")
      .find({
        $or: [
          { degree_id: { $in: degreeIds } },
          { specialization_id: { $in: specializationIds } }
        ]
      })
      .toArray();

    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Error fetching departments" });
  }
};

