import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'
import studentModel from '../models/studentModel.js'
import facultyModel from '../models/facultyModel.js'

const userAuth = async (req, res, next) => {
  const { token } = req.cookies

  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Login Again" })
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
    
    if (tokenDecode.id) {
      // Try to find the user in each model
      const [admin, student, faculty] = await Promise.all([
        adminModel.findById(tokenDecode.id),
        studentModel.findById(tokenDecode.id),
        facultyModel.findById(tokenDecode.id)
      ])

      const user = admin || student || faculty

      if (!user) {
        return res.json({ success: false, message: "User not found" })
      }

      // Add the user type to the request
      req.user = {
        ...user.toObject(),
        userType: admin ? 'admin' : student ? 'student' : 'faculty'
      }
      
      next()
    } else {
      return res.json({ success: false, message: "Not Authorized Login Again" })
    }
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export default userAuth