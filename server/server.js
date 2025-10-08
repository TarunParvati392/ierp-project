const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Register reference models for population
require('./models/School');
require('./models/Department');
require('./models/Degree');
require('./models/Specialization');
require('./models/Batch');

const app = express();
app.use(cors());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('iERP Backend Running');
});

const authRoutes = require('./routes/authorizationRoutes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/commonRoutes/userRoutes');
app.use('/api/user', userRoutes);

const degreeRoutes = require('./routes/commonRoutes/degreeRoutes');
app.use('/api/degrees', degreeRoutes);

const batchRoutes = require('./routes/academicManagerRoutes/batchRoutes');
app.use('/api/batches', batchRoutes);

const adminRoutes = require('./routes/admin/adminRoutes');
app.use('/api/admin', adminRoutes);

const staffRoutes = require('./routes/academicManagerRoutes/staffRoutes');
app.use('/api/staff', staffRoutes);

const schoolRoutes = require('./routes/commonRoutes/schoolRoutes');
app.use('/api/schools', schoolRoutes);

const academicRoutes = require('./routes/academicManagerRoutes/academicRoutes');
app.use('/api/academic-years', academicRoutes);

const termRoutes = require('./routes/academicManagerRoutes/termRoutes');
app.use('/api/terms', termRoutes);

const sectionRoutes = require('./routes/academicManagerRoutes/sectionRoutes');
app.use('/api/sections', sectionRoutes);

const schedulerRoutes = require("./routes/schedulerRoutes/schedulerRoutes");
app.use("/api/timetable", schedulerRoutes);

const payrollRoutes = require('./routes/HR/payrollRoutes');
app.use('/api/payroll', payrollRoutes);

//const faceLockRoutes = require('./routes/faceLockRoutes');
//app.use('/api/facelock', faceLockRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
