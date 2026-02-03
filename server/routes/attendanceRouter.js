import express from 'express';
import Attendance from '../models/attendanceModel.js';
import studentModel from '../models/studentModel.js';
import userAuth from '../middleware/userAuth.js';

const attendanceRouter = express.Router();

// Mark attendance for multiple students
attendanceRouter.post('/mark', userAuth, async (req, res) => {
  try {
    console.log('Received attendance request:', {
      user: req.user,
      body: req.body
    });

    const { records, markedBy } = req.body;

    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Allow both faculty and admin to mark attendance
    if (!req.user.reggNumber.startsWith('P') && !req.user.reggNumber.startsWith('A')) {
      console.error('Unauthorized user type:', req.user.userType);
      return res.status(403).json({ success: false, message: 'Only faculty or admin can mark attendance' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      console.error('Invalid records format:', records);
      return res.status(400).json({ success: false, message: 'Invalid attendance records format' });
    }

    const section = records[0].section;
    if (!section) {
      console.error('No section provided in records');
      return res.status(400).json({ success: false, message: 'Section not provided' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Fetching students for section:', section);
    const sectionStudents = await studentModel.find({ section }).select('reggNumber name');
    const sectionStudentReggNumbers = sectionStudents.map(s => s.reggNumber);
    console.log('Found students:', sectionStudentReggNumbers);

    // Process each student's attendance
    for (const student of sectionStudents) {
      let attendance = await Attendance.findOne({ reggNumber: student.reggNumber });
      
      // Find the record for this student in the submitted records
      const studentRecord = records.find(r => r.reggNumber === student.reggNumber);
      if (!studentRecord) {
        console.error(`No record found for student ${student.reggNumber}`);
        continue;
      }

      if (!attendance) {
        // Create new attendance record for the student
        attendance = new Attendance({
          reggNumber: student.reggNumber,
          name: student.name,
          section: section,
          attendance: [{
            date: today,
            periods: [{
              period: studentRecord.period,
              status: studentRecord.status === 'absent' ? 'Absent' : 'Present'
            }]
          }]
        });
      } else {
        // Find today's attendance record
        let todayRecord = attendance.attendance.find(r => {
          const recordDate = new Date(r.date);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === today.getTime();
        });

        if (!todayRecord) {
          // Create new record for today if it doesn't exist
          todayRecord = {
            date: today,
            periods: []
          };
          attendance.attendance.push(todayRecord);
        }

        // Find the period in today's record
        const existingPeriod = todayRecord.periods.find(p => p.period === studentRecord.period);
        
        if (existingPeriod) {
          // Update existing period
          existingPeriod.status = studentRecord.status === 'absent' ? 'Absent' : 'Present';
        } else {
          // Add new period
          todayRecord.periods.push({
            period: studentRecord.period,
            status: studentRecord.status === 'absent' ? 'Absent' : 'Present'
          });
        }
      }

      await attendance.save();
    }

    return res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
});

// Get attendance for a specific student
attendanceRouter.get('/student/:reggNumber', userAuth, async (req, res) => {
  try {
    const { reggNumber } = req.params;
    const user = req.user;

    // Allow faculty and admin to view any student's attendance
    if (user.reggNumber.startsWith('S') && user.reggNumber !== reggNumber) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view other students\' attendance'
      });
    }

    // Get the student's attendance record
    const attendance = await Attendance.findOne({ reggNumber });
    
    if (!attendance) {
      console.log(`No attendance record found for student ${reggNumber}`);
      return res.status(200).json({
        success: true,
        attendance: {
          totalClasses: 0,
          present: 0,
          absent: 0,
          history: []
        }
      });
    }

    // Calculate attendance statistics
    let totalClasses = 0;
    let present = 0;
    let absent = 0;
    const history = [];

    // Sort attendance records by date descending
    attendance.attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Process each day's attendance
    attendance.attendance.forEach(dayRecord => {
      const date = new Date(dayRecord.date);
      date.setHours(0, 0, 0, 0);
      
      // Sort periods in order
      dayRecord.periods.sort((a, b) => {
        const aNum = parseInt(a.period.split(' ')[1]);
        const bNum = parseInt(b.period.split(' ')[1]);
        return aNum - bNum;
      });

      // Add each period to history
      dayRecord.periods.forEach(period => {
        totalClasses++;
        if (period.status === 'Present') {
          present++;
        } else {
          absent++;
        }
        history.push({
          date: date,
          period: period.period,
          status: period.status
        });
      });
    });

    res.json({
      success: true,
      attendance: {
        totalClasses,
        present,
        absent,
        history
      }
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance'
    });
  }
});

// Get attendance for a section on a specific date
attendanceRouter.get('/section/:section/date/:date', userAuth, async (req, res) => {
  try {
    const { section, date } = req.params;
    const user = req.user;

    // Allow both faculty and admin to view section attendance
    if (user.reggNumber.startsWith('S')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view section attendance'
      });
    }

    // Get all students in the section
    const students = await studentModel.find({ section });
    const studentReggNumbers = students.map(s => s.reggNumber);

    // Get attendance records for the section
    const attendanceRecords = await Attendance.find({ 
      reggNumber: { $in: studentReggNumbers }
    });

    // Get today's date
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    // Find taken periods for today
    const takenPeriods = new Set();
    attendanceRecords.forEach(record => {
      const todayAttendance = record.attendance.find(a => {
        const recordDate = new Date(a.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });

      if (todayAttendance) {
        todayAttendance.periods.forEach(p => {
          takenPeriods.add(p.period);
        });
      }
    });

    res.json({
      success: true,
      attendance: attendanceRecords,
      takenPeriods: Array.from(takenPeriods)
    });
  } catch (error) {
    console.error('Error fetching section attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section attendance'
    });
  }
});

// Get attendance history for a section
attendanceRouter.get('/section/:section/history', userAuth, async (req, res) => {
  try {
    const { section } = req.params;
    const user = req.user;

    // Allow both faculty and admin to view section history
    if (user.reggNumber.startsWith('S')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view section attendance history'
      });
    }

    // Get all students in the section
    const students = await studentModel.find({ section });
    
    // Get attendance records for the section
    const attendanceRecords = await Attendance.find({ section })
      .sort({ date: -1 })
      .limit(100); // Get last 100 records

    // Group attendance by student
    const studentAttendance = {};
    students.forEach(student => {
      studentAttendance[student.reggNumber] = {
        name: student.name,
        reggNumber: student.reggNumber,
        attendance: []
      };
    });

    // Populate attendance records
    attendanceRecords.forEach(record => {
      if (studentAttendance[record.reggNumber]) {
        studentAttendance[record.reggNumber].attendance.push({
          date: record.date,
          status: record.status
        });
      }
    });

    // Convert to array format
    const result = Object.values(studentAttendance);

    res.json({
      success: true,
      section,
      students: result
    });
  } catch (error) {
    console.error('Error fetching section attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section attendance history'
    });
  }
});

export default attendanceRouter; 