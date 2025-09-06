const mongoose = require('mongoose');

const Degree = mongoose.connection.collection("degrees");
const Specialization = mongoose.connection.collection("specializations");
const Batch = mongoose.connection.collection("batches");

//Get All Degrees
exports.degree = async (req, res) =>{
    try{
        const degrees = await Degree.find({}).toArray();
        res.json(degrees);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Error fetching degrees" });
    }
};

exports.specialization = async (req, res) =>{
    try{
        const degreeId = new mongoose.Types.ObjectId(req.params.degreeId);
        const specs = await Specialization.find({ degree_id: degreeId }).toArray();
        res.json(specs);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Error fetching specializations" });
    }
};

exports.getBatches = async (req, res) => {
    try {
        const { degreeId, specializationId } = req.params;
        const filter = {
            degree_id: new mongoose.Types.ObjectId(degreeId),
        };

        // Only add specialization_id if it's not 'null' and not undefined
        if (specializationId && specializationId !== "null") {
            filter.specialization_id = new mongoose.Types.ObjectId(specializationId);
        }

        // Sort batches from latest to oldest by createdAt descending
        const batches = await Batch.find(filter).sort({ createdAt: -1 }).toArray();
        res.json(batches);
    } catch (err) {
        console.error("Error Fetching Batches:", err);
        res.status(500).json({ message: "Error fetching batches" });
    }
};

// Get All Batches (for filtering)
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find({}).sort({ createdAt: -1 }).toArray();
        res.json(batches);
    } catch (err) {
        console.error("Error fetching all batches:", err);
        res.status(500).json({ message: "Error fetching all batches" });
    }
};
