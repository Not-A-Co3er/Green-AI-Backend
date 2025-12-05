import express from 'express'; 
import { 
  isAuthenticated, 
  login, 
  logout, 
  register, 
  resetPassword, 
  sendResetOtp, 
  sendVerifyOtp, 
  verifyEmail 
} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

/* ------------------ AUTHENTICATION ROUTES ------------------ */

// Register a new user
authRouter.post('/register', register);

// Login user and generate token cookie
authRouter.post('/login', login);

// Log out user by clearing token cookie
authRouter.post('/logout', logout);

/* ------------------ EMAIL VERIFICATION ROUTES ------------------ */

// Send verification OTP to logged-in user's email
// `userAuth` ensures that only authenticated (but unverified) users can request OTP
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);

// Verify email using OTP received in email
// `userAuth` ensures that only the logged-in user can verify their own account
authRouter.post('/verify-account', userAuth, verifyEmail);


/* ------------------ CHECK USER AUTHENTICATED ------------------ */

// Check whether token is valid and user is logged-in
// Used by frontend to auto-login users on page refresh
authRouter.get('/is-auth', userAuth, isAuthenticated);

/* ------------------ PASSWORD RESET ROUTES ------------------ */

// Send a password reset OTP to user's email
// No login required because user might have forgotten password
authRouter.post('/send-reset-otp', sendResetOtp);

// Reset password using email + OTP + new password
authRouter.post('/reset-password', resetPassword);



export default authRouter;   // Export router so it can be mounted in server.js
