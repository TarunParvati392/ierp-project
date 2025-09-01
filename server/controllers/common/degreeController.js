const mongoose = require('mongoose');

const Degree = mongoose.connection.collection("degrees");
const Specialization = mongoose.connection.collection("specializations");

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