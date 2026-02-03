import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({
    reggNumber:{type: String, required:true,unique:true},
    name:{type: String, required:true},
    email:{type: String, required:true,unique:true},
    password:{type: String, required:true},
    
    phoneNumber:{type: String, required:true},
    address:{type: String, required:true},
    qualification:{type: String, required:true},
    parentName:{type: String, required:true},
    verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 }
    
   
})

const facultyModel=mongoose.models.faculty || mongoose.model('faculty',userSchema)

export default facultyModel