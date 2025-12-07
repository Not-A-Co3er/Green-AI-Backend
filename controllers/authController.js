// This file contains all authentication-related controllers (REGISTER, LOGIN, LOGOUT,
// EMAIL VERIFICATION, PASSWORD RESET). Each function handles a specific step in the
// user authentication lifecycle and interacts with the userModel, JWT tokens,
// encrypted passwords, and Nodemailer emails.

import bcrypt from 'bcryptjs';                 // For hashing passwords and comparing them securely
import jwt from 'jsonwebtoken';                // For generating authentication tokens
import userModel from '../models/userModel.js'; // Mongoose model for users stored in MongoDB
import transporter from '../config/nodemailer.js';

// ---------------- REGISTER CONTROLLER ----------------
export const register = async (req, res) => {

    const { name, email, password } = req.body; // Extract user details from request body

    // Validate request body
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        // Check if a user with same email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        // Hash the password with salt rounds = 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user and save in database
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // Generate authentication token with 7 days expiry
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Store token in cookie
        res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
});


        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,                     // Sender email from .env
            to: email,                                          // Recipient's email (passed from controller)
            subject: 'Welcome OnBoard To GreenAi!',                   // Email subject
            text: `Welcome! Your account has been created with email: ${email}` // Email body text
        };

        // Send the email using the transporter
        await transporter.sendMail(mailOptions);

        

    return res.json({ success: true, message: "Registration successful" });
    }
    catch (error){
        return res.json({ success: false, message: error.message });
    }
};


// ---------------- LOGIN CONTROLLER ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Check user existence
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie — FIXED CONFIG (mandatory for Render + frontend)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,         // must be true on HTTPS
      sameSite: "none",     // must be none when frontend and backend are different domains
      path: "/",
    });

    // 🔥 MUST return JSON after setting cookie
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// ---------------- LOGOUT CONTROLLER ----------------
export const logout = async (req, res) => {
    try {
        // Clear token from cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};




// --------------Send Verification OTP to the User's Email-------------
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user);

    // If already verified → no need to send OTP again
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // Generate 6-digit OTP as a string
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP and expiry timestamp (valid for 24 hours)
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Configure email content
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. It is valid for 24 hours.`
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Verification OTP sent to your email"
    });

  }catch (error) {
    return res.json({ success: false, message: "error.message" });
  }
};




// ---------------------Verify user email using OTP----------------------
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;  // Extract userId and OTP from request

  // Validate request body
  if (!userId || !otp) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Check if OTP is missing or does not match
    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    // Mark user as verified
    user.isAccountVerified = true;
    user.verifyOtp = '';             // Clear stored OTP
    user.verifyOtpExpireAt = 0;      // Clear OTP expiration timestamp
    await user.save();               // Save updated user in DB

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};




//------------------- Controller to check whether a user is authenticated-----------------
export const isAuthenticated = async (req, res) => {
  try {
    // If this controller is reached, middleware has already verified JWT token
    // and attached the logged-in user's ID to req.user

    return res.json({
      success: true,
      message: "User is authenticated",
      userId: req.user  // Optional: return logged-in user ID
    });

  } catch (error) {
    // Handles unexpected errors
    return res.json({ success: false, message: error.message });
  }
};



//-----Send Password Reset OTP------------
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  // check if email present
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    // check if user exists with given email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "No user found with this email" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP and expiry timestamp (valid for 24 hours)
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    
    await user.save();

    // Configure email content
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is  ${otp}.`
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);    

    return res.json({success: true, message: "OTP sent successfully to your mail"});

  } 
  catch (error) {
    return res.json({success: false,message: error.message});
  }
};



//--------------Reset User Password------------------
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || String(user.resetOtp) !== String(otp)) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
