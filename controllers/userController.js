// This controller handles fetching the logged-in user's profile details.
// It receives the user's ID from the authentication middleware, retrieves
// corresponding details from the database, and returns safe/non-sensitive
// information (excluding password) back to the client.

import userModel from "../models/userModel.js";

// Controller to fetch logged-in user's profile data
export const getUserData = async (req, res) => {
  try {
    // userAuth middleware has already attached logged-in user ID here
    const userId = req.user;

    // Fetch user from database (exclude password for safety)
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Send response with required fields
    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      },
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
