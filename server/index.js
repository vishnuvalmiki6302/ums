import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRouter from './routes/eventRouter.js';
import Event from './models/EventModel.js'; // Import the Event model

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Verify Event model is properly initialized
    try {
      const eventCount = await Event.countDocuments();
      console.log(`Current number of events in database: ${eventCount}`);
    } catch (error) {
      console.error('Error checking Event collection:', error);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB before starting the server
connectDB().then(() => {
  // Register routes after successful connection
  app.use('/api/events', eventRouter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 