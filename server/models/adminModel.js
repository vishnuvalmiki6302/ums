

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  reggNumber: { type: String, required: true ,unique:true},
  name: { type: String, required: true },
  password: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 }
});

const adminModel = mongoose.models.admins || mongoose.model("admins", userSchema);

export default adminModel;
