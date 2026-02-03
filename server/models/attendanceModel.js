import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  reggNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    periods: [{
      period: {
        type: String,
        enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'],
        required: true
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
      }
    }]
  }]
}, {
  timestamps: true,
  collection: 'attendance_details'
});

// Use consistent model name
const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 