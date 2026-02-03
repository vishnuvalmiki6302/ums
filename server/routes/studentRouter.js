import express from 'express';
import studentModel from '../models/studentModel.js';
import Attendance from '../models/attendanceModel.js';
import mongoose from 'mongoose';

const studentRouter = express.Router();


studentRouter.post('/register', async (req, res) => {
    const { name, reggNumber, section, course, email, phoneNumber, parentName, parentNumber, photo_front, photo_back } = req.body;

    try {
        const existingStudent = await studentModel.findOne({ reggNumber });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Student already exists' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const student = await studentModel.create([{
                name,
                reggNumber,
                section,
                course,
                email,
                phoneNumber,
                parentName,
                parentNumber,
                photo_front,
                photo_back
            }], { session });

            await Attendance.create([{
                reggNumber,
                attendance: []
            }], { session });

            await session.commitTransaction();
            res.status(201).json({ success: true, student });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// New endpoint to get all students with photo_front as base64 string
studentRouter.get('/', async (req, res) => {
  try {
    const students = await studentModel.find();

    // Convert photo_front buffer to base64 string
    const studentsWithPhotos = students.map(student => {
      let photoFrontBase64 = null;
      if (student.photo_front) {
        photoFrontBase64 = `data:image/jpeg;base64,${student.photo_front.toString('base64')}`;
      }
      return {
        _id: student._id,
        reggNumber: student.reggNumber,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        parentName: student.parentName,
        parentNumber: student.parentNumber,
        section: student.section,
        course: student.course,
        photo_front: photoFrontBase64,
      };
    });

    res.status(200).json({ success: true, students: studentsWithPhotos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

studentRouter.get('/section/:section', async (req, res) => {
    const { section } = req.params;
    const { reggNumber } = req.query;

    if (!section) {
        return res.status(400).json({ success: false, message: 'Section is required' });
    }

    try {
        let query = { section };
        if (reggNumber && reggNumber.startsWith('S')) {
            query.reggNumber = reggNumber;
        }

        const students = await studentModel.find(query)
            .select('name reggNumber section photo_front')
            .lean();

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found' });
        }

        // Convert photo_front buffer to base64 string
        const studentsWithPhotos = students.map(student => {
            let photoFrontBase64 = null;
            if (student.photo_front) {
                photoFrontBase64 = `data:image/jpeg;base64,${student.photo_front.toString('base64')}`;
            }
            return {
                ...student,
                photo_front: photoFrontBase64
            };
        });

        res.json({ success: true, students: studentsWithPhotos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

studentRouter.get('/attendance/:reggNumber', async (req, res) => {
    const { reggNumber } = req.params;

    if (!reggNumber || !reggNumber.startsWith('S')) {
        return res.status(400).json({ success: false, message: 'Invalid registration number' });
    }

    try {
        const student = await studentModel.findOne({ reggNumber });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const attendance = await Attendance.findOne({ reggNumber });
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No attendance record found' });
        }

        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default studentRouter;
