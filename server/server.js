const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

//const faceLockRoutes = require('./routes/faceLockRoutes');
//app.use('/api/facelock', faceLockRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
