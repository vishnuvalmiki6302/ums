import express from 'express';
import facultyModel from '../models/facultyModel.js';
import bcrypt from 'bcryptjs';

const facultyRouter = express.Router();


facultyRouter.post('/register', async (req, res) => {
    try {
        const {
            reggNumber,
            name,
            email,
            phoneNumber,
            address,
            parentName,
            qualification,
            password,
        } = req.body;

        const existingFaculty = await facultyModel.findOne({ reggNumber });
        if (existingFaculty) {
            return res.status(400).json({ success: false, message: 'Faculty already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const faculty = new facultyModel({
            reggNumber,
            name,
            email,
            phoneNumber,
            address,
            parentName,
            qualification,
            password: hashedPassword,
        });

        await faculty.save();
        res.status(201).json({ 
            success: true, 
            message: '✅ Faculty registered successfully',
            faculty: {
                reggNumber: faculty.reggNumber,
                name: faculty.name,
                email: faculty.email
            }
        });

    } catch (error) {
        console.error('❌ Error creating faculty:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});


facultyRouter.get('/section/:section', async (req, res) => {
    try {
        const { section } = req.params;

        const facultys = await facultyModel.find({ section });

        res.status(200).json({ success: true, facultys });
    } catch (error) {
        console.error('❌ Error fetching facultys by section:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


export default facultyRouter;
