import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';

// Create a router object for user-related routes
const userRouter = express.Router();

/* 
  Route: GET /api/user/data
  Purpose: Fetch logged-in user's profile information
  Middleware: userAuth → ensures only authenticated users can access it
*/
userRouter.get('/data', userAuth, getUserData);

// Export router so it can be used in server.js
export default userRouter;



