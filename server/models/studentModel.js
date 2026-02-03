import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  reggNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  parentName: { type: String, required: true },
  parentNumber: { type: String, required: true },
  section: { type: String, required: true },
  password: { type: String, required: true },
  course: { type: String, required: true },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
  photo_front: { type: Buffer },
photo_left: { type: Buffer },
photo_right: { type: Buffer },


});

const studentModel = mongoose.models.students || mongoose.model("students", userSchema);

export default studentModel;