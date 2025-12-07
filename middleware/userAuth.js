import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;   // read token from cookie

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again"
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user from database
    const loggedInUser = await User.findById(decoded.id).select("-password");

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // put full user object in req.user
    req.user = loggedInUser;

    next();   // pass control to next controller
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default userAuth;
