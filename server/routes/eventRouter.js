import express from 'express';
import Event from '../models/EventModel.js';
import userAuth from '../middleware/userAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Check database connection middleware
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('Database not connected. State:', mongoose.connection.readyState);
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
      state: mongoose.connection.readyState
    });
  }
  next();
};

// Get all events
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const events = await Event.find().sort({ date: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new event
router.post('/', userAuth, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      createdBy: req.user._id
    });

    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update an event
router.put('/:id', userAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete an event
router.delete('/:id', userAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router; 