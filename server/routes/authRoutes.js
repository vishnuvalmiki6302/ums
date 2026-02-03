// // import express from 'express'
// // import { login, logout, register, sendVerifyOtp,verifyEmail ,isAuthenticated, sendResetOtp, resetPassword} from '../controllers/authController.js'
// // import userAuth from '../middleware/userAuth.js'

// // const authRouter=express.Router()

// // authRouter.post('/register',register)
// // authRouter.post('/login',login)
// // authRouter.post('/logout',logout)
// // authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
// // authRouter.post('/verify-account',userAuth,verifyEmail)
// // authRouter.get('/is-auth',userAuth,isAuthenticated)
// // authRouter.post('/send-reset-otp',sendResetOtp)
// // authRouter.post('/reset-password',resetPassword)



// // export default authRouter


// import express from 'express';
// import { login, logout, register, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from '../controllers/authController.js';
// import userAuth from '../middleware/userAuth.js';
// import { upload } from '../controllers/authController.js'; // Make sure the multer upload is imported

// const authRouter = express.Router();

// authRouter.post('/register', (req, res, next) => {
//   const reggNumber = req.body.reggNumber;
//   if (reggNumber && reggNumber[0] === 'S') {
//     upload.fields([
//       { name: 'photo_front', maxCount: 1 },
//       { name: 'photo_left', maxCount: 1 },
//       { name: 'photo_right', maxCount: 1 }
//     ])(req, res, (err) => {
//       if (err) {
//         return res.status(400).json({ success: false, message: err.message });
//       }
//       if (!req.files?.photo_front || !req.files?.photo_left || !req.files?.photo_right) {
//         return res.status(400).json({ success: false, message: 'Please upload all required photos (front, left, right).' });
//       }
//       next();
//     });
//   } else {
//     next();
//   }
// }, register);

// authRouter.post('/login', login);
// authRouter.post('/logout', logout);
// authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
// authRouter.post('/verify-account', userAuth, verifyEmail);
// authRouter.get('/is-auth', userAuth, isAuthenticated);
// authRouter.post('/send-reset-otp', sendResetOtp);
// authRouter.post('/reset-password', resetPassword);

// export default authRouter;


import express from 'express';
import { login, logout, register, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword, upload } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();


authRouter.post('/register', upload.fields([
  { name: 'photo_front', maxCount: 1 },
  { name: 'photo_left', maxCount: 1 },
  { name: 'photo_right', maxCount: 1 }
]), (req, res, next) => {
  const reggNumber = req.body.reggNumber;
  if (reggNumber && reggNumber[0] === 'S') {
    if (!req.files?.photo_front || !req.files?.photo_left || !req.files?.photo_right) {
      return res.status(400).json({ success: false, message: 'Please upload all required photos (front, left, right).' });
    }
  }
  next();
}, register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
