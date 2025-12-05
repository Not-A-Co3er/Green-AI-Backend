// This is basically a JWT Authentication middleware which  protects private routes by checking if the user is logged in.
// It verifies the JWT token stored in browser cookies, extracts the user's ID,
// and attaches it to req.user so the next controller can identify the logged-in user.
// If the token is missing or invalid, the user is blocked from accessing the route.

import jwt from "jsonwebtoken";                 // Import JWT library to verify user authentication token

// Middleware to protect private routes
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;   // Read token stored in user's browser cookie

  // If no token → user is not logged in
  if (!token) {
    return res.json({ success: false, message: 'Not Authorized. Login Again' });
  }

  try {
    // Verify the token using the secret key
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // If token contains a valid user ID, attach it to request so next controllers can use it
    if (tokenDecode.id) {
      req.user = tokenDecode.id;                          // Adds userId to request body
    } else {
      return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }
    next(); 
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;   // Export middleware so it can be used in routes
