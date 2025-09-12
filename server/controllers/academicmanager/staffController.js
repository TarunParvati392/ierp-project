const User = require("../../models/User");
const mongoose = require("mongoose");
const School = mongoose.connection.collection("schools");
const Department = mongoose.connection.collection("departments");
const sendEmail = require("../../utils/sendEmail");

// 🔹 Get All Deans
exports.getAllDeans = async (req, res) => {
  try {
    const deans = await User.find({ role: "Dean" })
      .select("userId name email role school_id")
      .populate("school_id", "school_name");
    res.json(deans);
  } catch (err) {
    console.error("Error fetching deans:", err);
    res.status(500).json({ message: "Error fetching deans" });
  }
};

// 🔹 Get All HODs
exports.getAllHODs = async (req, res) => {
  try {
    const HODs = await User.find({ role: "HOD" })
      .select("userId name email role department_id school_id")
      .populate("school_id", "school_name")
      .populate("department_id", "department_name");
    res.json(HODs);
  } catch (err) {
    console.error("Error fetching HODs:", err);
    res.status(500).json({ message: "Error fetching HODs" });
  }
};

// 🔹 Get All Faculty
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "Faculty" })
      .select("userId name email role department_id school_id")
      .populate("school_id", "school_name")
      .populate("department_id", "department_name");
    res.json(faculty);
  } catch (err) {
    console.error("Error fetching Faculty:", err);
    res.status(500).json({ message: "Error fetching Faculty" });
  }
};

// Assign Dean to School
exports.assignDean = async (req, res) => {
  try {
    const { deanId, schoolId } = req.body;

    if (!deanId || !schoolId) {
      return res.status(400).json({ message: "Dean ID and School ID are required" });
    }

    // Check Dean exists
    const dean = await User.findOne({ _id: deanId, role: "Dean" });
    if (!dean) {
      return res.status(404).json({ message: "Dean not found" });
    }

    // Check School exists
    const School = mongoose.connection.collection("schools");
    const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Check if School already has a Dean
    const existingDean = await User.findOne({ role: "Dean", school_id: schoolId });
    if (existingDean) {
      return res.status(400).json({ message: "This school is already assigned to another Dean" });
    }

    // Check if Dean already assigned a school
    if (dean.school_id) {
      return res.status(400).json({ message: "This Dean is already assigned to a school" });
    }

    // Assign School to Dean
    dean.school_id = schoolId;
    await dean.save();

    // Send email notification
    await sendEmail(
      dean.email,
      "iERP: Dean Assignment",
      undefined,
      `<p>Dear ${dean.name},</p>
       <p>You have been assigned as the <b>Dean</b> of <b>${school.school_name}</b>.</p>
       <p>Please log in to your iERP account to manage your school.</p>`
    );

    res.status(200).json({ message: "Dean assigned successfully", dean });

  } catch (err) {
    console.error("Error assigning dean:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get Dean assigned to a school
exports.getDeanBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const dean = await User.findOne({
      role: "Dean",
      school_id: new mongoose.Types.ObjectId(schoolId),
    }).select("name userId email");

    if (!dean) {
      return res.json({ dean: null });
    }

    res.json({ dean });
  } catch (err) {
    console.error("Error fetching dean by school:", err);
    res.status(500).json({ message: "Error fetching dean" });
  }
};

// 🔹 De-Assign Dean from a school
exports.deAssignDean = async (req, res) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required" });
    }

    // Find the dean linked with this school
    const dean = await User.findOne({
      role: "Dean",
      school_id: new mongoose.Types.ObjectId(schoolId),
    });

    if (!dean) {
      return res.status(400).json({ message: "No dean is assigned to this school" });
    }

    // Remove the dean's school_id
    dean.school_id = null;
    await dean.save();

    // Fetch school name for mail
    const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });

    // Send email to dean
    await sendEmail(
      dean.email,
      "iERP: Dean De-Assigned",
      undefined,
      `<p>Dear ${dean.name},</p>
       <p>You have been <b>de-assigned</b> from the school: <b>${school.school_name}</b>.</p>
       <p>If you think this is a mistake, please contact the administration.</p>
       <br/>
       <p>Regards,<br/>iERP Team</p>`
    );

    res.json({ message: "Dean de-assigned successfully and mail sent" });
  } catch (err) {
    console.error("Error de-assigning dean:", err);
    res.status(500).json({ message: "Error de-assigning dean" });
  }
};

// Assign HOD
exports.assignHOD = async (req, res) => {
  try {
    const { HODId, schoolId, departmentId } = req.body;

    if (!HODId || !schoolId || !departmentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate HOD
    const HOD = await User.findOne({ _id: HODId, role: "HOD" });
    if (!HOD) return res.status(404).json({ message: "HOD not found" });

    // Validate School
    const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
    if (!school) return res.status(404).json({ message: "School not found" });

    // Validate Department
    const department = await Department.findOne({ _id: new mongoose.Types.ObjectId(departmentId), 
      school_id: new mongoose.Types.ObjectId(schoolId) });
    if (!department) {
      return res.status(404).json({ message: "Department not found in this school" });
    }

    // Condition 1: Check if department already has a HOD
    const existingHODForDept = await User.findOne({ department_id: departmentId, role: "HOD" });
    if (existingHODForDept) {
      return res.status(400).json({ message: "This department is already assigned to another HOD" });
    }

    // Condition 2: Check if HOD already assigned to another department
    if (HOD.department_id) {
      return res.status(400).json({ message: "This HOD is already assigned to another department" });
    }

    // Assign
    HOD.school_id = schoolId;
    HOD.department_id = departmentId;
    await HOD.save();

    // Send mail
    await sendEmail(
      HOD.email,
      "iERP: HOD Assignment",
      undefined,
      `<p>Dear ${HOD.name},</p>
       <p>You have been assigned as <b>HOD</b> for the department <b>${department.department_name}</b> 
       in the school <b>${school.school_name}</b>.</p>
       <p>Regards,<br/>Academic Manager</p>`
    );

    return res.json({ message: "HOD assigned successfully and email sent" });
  } catch (err) {
    console.error("Assign HOD error:", err);
    res.status(500).json({ message: "Error assigning HOD" });
  }
};

//Get HOD By Department
exports.getHODbyDepartment = async (req, res) => {
  try{
    const { departmentId } = req.params;
    const HOD = await User.findOne({
      role: "HOD",
      department_id: new mongoose.Types.ObjectId(departmentId)
    }).select("name userId email");

    if(!HOD){
      return res.json({HOD: null});
    }

    res.json({ HOD });
  } catch(err){
    res.status(500).json({ message: "Error fetching HOD" });
  }
};

exports.deAssignHOD = async (req, res) => {
    try{
        const { departmentId, schoolId } = req.body;

        if (!departmentId) return res.status(400).json({ message: "Department ID is Required"});

        //Find HOD
        const HOD = await User.findOne({
          role: "HOD",
          school_id: new mongoose.Types.ObjectId(schoolId),
          department_id: new mongoose.Types.ObjectId(departmentId),
        });

        if (!HOD) return res.status(400).json({ message: "No HOD is Assigned to this Department"});

        //Remove HOD School and Department ID's
        HOD.school_id = null;
        HOD.department_id = null;
        await HOD.save();

        const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
        const department = await Department.findOne({
          _id: new mongoose.Types.ObjectId(departmentId),
        });

        //Send Mail
        await sendEmail(
          HOD.email,
          "iERP: HOD De-Assigned",
          undefined,
          `<p>Dear ${HOD.name},</P>
           <p>You have been <b>De-Assigned</b> from the Department: <b>${department.department_name}</b> under the School: <b>${school.school_name}</b>.</p>
           <p> If you think this is a mistake, please contact Administration.</p>
           <br/>
           <p>Regards,<br/>iERP Team</p>`
        );
        res.json({ message: "HOD De-Assigned successfully and email sent" });
    } catch (err){
      res.status(500).json({ message: "Error De-Assigning HOD"});
    }
};

exports.assignFaculty = async (req, res) => {
  try{
    const { FacultyId, schoolId, departmentId } = req.body;

    if (!FacultyId || !schoolId || !departmentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate Faculty
    const faculty = await User.findOne({ _id: FacultyId, role: "Faculty" });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Validate School
    const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
    if (!school) return res.status(404).json({ message: "School not found" });

    // Validate Department
    const department = await Department.findOne({ _id: new mongoose.Types.ObjectId(departmentId), 
      school_id: new mongoose.Types.ObjectId(schoolId) });
    if (!department) return res.status(404).json({ message: "Department not found" });

    // Check if Faculty is already assigned
    if (faculty.department_id) {
      return res.status(400).json({ message: "This Faculty is already assigned in another department" });
    }

    // Assign
    faculty.school_id = schoolId;
    faculty.department_id = departmentId;
    await faculty.save();

    // Send mail
    await sendEmail(
      faculty.email,
      "iERP: Faculty Assignment",
      undefined,
      `<p>Dear ${faculty.name},</p>
       <p>You have been assigned to the department <b>${department.department_name}</b> 
       in the school <b>${school.school_name}</b>.</p>
       <p>Regards,<br/>Academic Manager</p>`
    );

    return res.json({ message: "Faculty assigned successfully and email sent" });
  } catch (err) {
    console.error("Assign Faculty error:", err);
    res.status(500).json({ message: "Error assigning Faculty" });
  }
};

exports.getFacultybyDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const faculty = await User.find({
      role: "Faculty",
      department_id: new mongoose.Types.ObjectId(departmentId)
    }).select("name userId email");

    if (!faculty || faculty.length === 0) {
      return res.json({ faculty: [] });
    }

    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ message: "Error fetching Faculty" });
  }
};

exports.deAssignFaculty = async (req, res) => {
  try {
    const { schoolId, departmentId, facultyId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "School ID is Required"});
    if (!departmentId) return res.status(400).json({ message: "Department ID is Required"});
    if (!facultyId) return res.status(400).json({ message: "Faculty ID is Required"});

    //Find Faculty
    const faculty = await User.findOne({
      _id: new mongoose.Types.ObjectId(facultyId),
      role: "Faculty",
      school_id: new mongoose.Types.ObjectId(schoolId),
      department_id: new mongoose.Types.ObjectId(departmentId),
    })

    if (!faculty) return res.status(400).json({ message: "Faculty Not Assigned to this Department"});

    //Remove Faculty School and Department ID's
    faculty.school_id = null;
    faculty.department_id = null;
    await faculty.save();

    const school = await School.findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
    const department = await Department.findOne({
      _id: new mongoose.Types.ObjectId(departmentId),
    });

    //Send Mail
    await sendEmail(
      faculty.email,
      "iERP: Faculty De-Assigned",
      undefined,
      `<p>Dear ${faculty.name},</P>
       <p>You have been <b>De-Assigned</b> from the Department: <b>${department.department_name}</b> under the School: <b>${school.school_name}</b>.</p>
       <p> If you think this is a mistake, please contact Administration.</p>
       <br/>
       <p>Regards,<br/>iERP Team</p>`
    );
    res.json({ message: "Faculty De-Assigned successfully and email sent" });
  } catch (err) {
    res.status(500).json({ message: "Error de-assigning Faculty" });
  }
};