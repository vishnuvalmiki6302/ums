import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/UMS`);
    console.log(" Database Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
