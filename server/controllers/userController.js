import adminModel from '../models/adminModel.js'
import facultyModel from '../models/facultyModel.js'
import studentModel from '../models/studentModel.js'


  

export const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const user =
      (await studentModel.findById(userId)) ||
      (await facultyModel.findById(userId)) ||
      (await adminModel.findById(userId));

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const convertToBase64 = (buffer) => {
      return buffer ? `data:image/jpeg;base64,${buffer.toString('base64')}` : null;
    };

    let userData = {
      reggNumber: user.reggNumber,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAccountVerified: user.isAccountVerified,
      userType: req.user.userType 
    };

    if (user.reggNumber && user.reggNumber[0] === "S") {
      userData = {
        ...userData,
        section: user.section,
        course: user.course,
        parentName: user.parentName,
        parentNumber: user.parentNumber,
        photoFront: convertToBase64(user.photo_front),
        photoLeft: convertToBase64(user.photo_left),
        photoRight: convertToBase64(user.photo_right)
      };
    } else if (user.reggNumber && user.reggNumber[0] === "P") {
      userData = {
        ...userData,
        qualification: user.qualification,
        address: user.address
      };
    } else if (user.reggNumber && user.reggNumber[0] === "A") {
      userData = {
        ...userData,
      };
    }

    res.json({
      success: true,
      userData: userData
    });

  } catch (error) {
    console.error('Error in getUserData:', error);
    res.json({ success: false, message: error.message });
  }
};




