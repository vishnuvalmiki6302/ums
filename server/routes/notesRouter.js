import express from 'express';
import Notes from '../models/notesModel.js';
import userAuth from '../middleware/userAuth.js';
import multer from 'multer';

const router = express.Router();

// Memory storage (works on Vercel serverless - no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Notes router is working' });
});

router.post('/upload', userAuth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!req.body.subject || !req.body.section) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newNote = new Notes({
      subject: req.body.subject,
      section: req.body.section,
      pdfUrl: '', // Not used when storing in DB
      pdfData: req.file.buffer,
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });

    await newNote.save();
    res.status(201).json({
      success: true,
      note: {
        _id: newNote._id,
        subject: newNote.subject,
        section: newNote.section,
        fileName: newNote.fileName,
        uploadedAt: newNote.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download PDF by ID (serves buffer from MongoDB)
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id).select('pdfData fileName');
    if (!note || !note.pdfData) {
      return res.status(404).json({ success: false, message: 'Note or file not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.fileName || 'note.pdf'}"`);
    res.send(note.pdfData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { section, subject } = req.query;
    const query = {};
    if (section) query.section = section;
    if (subject) query.subject = subject;

    const notes = await Notes.find(query)
      .select('-pdfData')
      .sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Notes.distinct('subject');
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
