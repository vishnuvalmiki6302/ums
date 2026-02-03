import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import facultyModel from '../models/facultyModel.js'
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'
import studentModel from '../models/studentModel.js'
import adminModel from '../models/adminModel.js'
import multer from 'multer';
import { Readable } from 'stream';
import Attendance from '../models/attendanceModel.js'

export const upload = multer({ storage: multer.memoryStorage() });

export const register = async (req, res) => {
  const { reggNumber } = req.body;
  console.log(req.body);
  let email, password, course, parentNumber, section, parentName, name, address, phoneNumber, qualification;

  if (reggNumber[0] === "S") {
    ({ email, password, course, parentNumber, section, parentName, phoneNumber, name } = req.body);
  } else if (reggNumber[0] === "P") {
    ({ email, password, parentName, reggNumber, phoneNumber, address, qualification, name } = req.body);
  } else if (reggNumber[0] === "A") {
    if (req.body.universityCode === process.env.UNIVERSITY_CODE) {
      ({ email, password, name } = req.body);
    } else {
      return res.json({ success: false, message: "University code is invalid" });
    }
  }

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    let existingUser;
    if (reggNumber[0] === "P") {
      existingUser = await facultyModel.findOne({ reggNumber });
    } else if (reggNumber[0] === "S") {
      existingUser = await studentModel.findOne({ reggNumber });
    } else if (reggNumber[0] === "A") {
      existingUser = await adminModel.findOne({ reggNumber });
    }

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (reggNumber[0] === "S") {
      const { photo_front, photo_left, photo_right } = req.files;

      if (!photo_front || !photo_left || !photo_right) {
        return res.json({ success: false, message: "All photos are required" });
      }

      user = new studentModel({
        name,
        email,
        password: hashedPassword,
        course,
        parentNumber,
        section,
        parentName,
        reggNumber,
        phoneNumber,
        photo_front: photo_front[0].buffer,
        photo_left: photo_left[0].buffer,
        photo_right: photo_right[0].buffer
      });
      await user.save();

      console.log('✅ Student record created successfully in students collection');
 
            console.log('Creating attendance record in attendance_details collection...');
            // Create attendance record in attendance_details collection
            const attendance = new Attendance({
                reggNumber,
                name,
                section,
                attendance: [] // Start with empty attendance array
            });

            await attendance.save();
            console.log('✅ Attendance record created successfully in attendance_details collection');


      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to Our Website",
        text: `Your account is successfully created in our website with your email address ${email}`,
      };

      await transporter.sendMail(mailOptions);
      return res.json({ success: true });

    } else if (reggNumber[0] === "P") {
      user = new facultyModel({ name, email, password: hashedPassword, parentName, address, qualification, reggNumber, phoneNumber });
    } else if (reggNumber[0] === "A") {
      user = new adminModel({ name, email, reggNumber, password: hashedPassword });
    } else {
      return res.json({ success: false, message: "Missing Details" });
    }

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Our Website",
      text: `Your account is successfully created in our website with your email address ${email}`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { reggNumber, password } = req.body;
  if (!reggNumber || !password) {
    return res.json({ success: false, message: "Registration number and password are required" });
  }

  try {
    // Try to find user in all three models
    let user = await studentModel.findOne({ reggNumber });
    if (!user) {
      user = await facultyModel.findOne({ reggNumber });
    }
    if (!user) {
      user = await adminModel.findOne({ reggNumber });
    }

    if (!user) {
      return res.json({ success: false, message: "Invalid Registration Number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Determine user type based on the model
    let userType;
    if (user instanceof studentModel) {
      userType = 'student';
    } else if (user instanceof facultyModel) {
      userType = 'faculty';
    } else if (user instanceof adminModel) {
      userType = 'admin';
    }

    const token = jwt.sign({ 
      id: user._id,
      userType: userType,
      reggNumber: user.reggNumber
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ 
      success: true, 
      message: "Login Successful",
      userType: userType,
      name: user.name
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.json({ success: false, message: "An error occurred during login" });
  }
}


export const logout = async (req, res) => {

  try {

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

    })

    return res.json({ success: true, message: "Logged Out" })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }

}

export const sendVerifyOtp = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;
    console.log('User ID:', userId);  

    let user = await facultyModel.findById(userId);
    if (!user) user = await adminModel.findById(userId);
    if (!user) user = await studentModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Verification OTP sent to your email" });

  } catch (error) {
    console.error('Error in sendVerifyOtp:', error);
    res.json({ success: false, message: error.message });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;

    if (!otp) {
      return res.json({ success: false, message: "OTP is required" });
    }

    // Try to find the user in any of the three models
    let user = await studentModel.findById(userId);
    if (!user) user = await facultyModel.findById(userId);
    if (!user) user = await adminModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account is already verified" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // Update user verification status
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();

    // Return updated user data
    return res.json({ 
      success: true, 
      message: "Email verified successfully",
      userData: {
        isAccountVerified: true,
        name: user.name,
        reggNumber: user.reggNumber,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error in verifyEmail:', error);
    return res.json({ success: false, message: "An error occurred during verification" });
  }
};

export const isAuthenticated = async (req, res) => {
  try {

    return res.json({ success: true })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }

}

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    // Try to find user in all three models
    let user = await studentModel.findOne({ email });
    if (!user) user = await facultyModel.findOne({ email });
    if (!user) user = await adminModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "No account found with this email" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    };

    await transporter.sendMail(mailOption);

    res.json({ 
      success: true, 
      message: "OTP sent to your email",
      email: user.email // Send back email for frontend reference
    });

  } catch (error) {
    console.error('Error in sendResetOtp:', error);
    return res.json({ success: false, message: "Failed to send reset OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP and new password are required" });
  }

  try {
    // Try to find user in all three models
    let user = await studentModel.findOne({ email });
    if (!user) user = await facultyModel.findOne({ email });
    if (!user) user = await adminModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Successful",
      text: `Your password has been reset successfully. If you did not request this change, please contact support immediately.`
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "Password has been reset successfully" });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.json({ success: false, message: "Failed to reset password" });
  }
};