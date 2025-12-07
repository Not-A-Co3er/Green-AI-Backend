// ------------------- Module Imports -------------------
import express from "express";                       // Express framework for creating server & APIs
import cors from "cors";                             // Middleware to allow frontend and backend communication
import 'dotenv/config';                              // Loads environment variables from .env file
import cookieParser from "cookie-parser";            // For reading cookies (used for authentication)

// ------------------- Internal Imports -------------------
import connectDB from "./config/mongodb.js";         // MongoDB connection function
import authRouter from "./routes/authRoutes.js";     // Authentication routes
import userRouter from "./routes/userRoutes.js";     // User profile routes
import plantRouter from "./routes/plantRoutes.js";   // Plant analysis routes (AI module)


// ------------------- Server Setup -------------------
const app = express();                               // Creates Express server
const port = process.env.PORT || 4000;               // Server port from .env or default 4000

connectDB();                                         // Connect to MongoDB when server starts

 
// ------------------- Global Middlewares ------------------- They just prepare the request system before any route is used.
app.use(express.json());                             // Allows the backend to read JSON data sent from the frontend.

// Example: If frontend sends:{ "email": "test@gmail.com", "password": "123" }

// Then req.body.email and req.body.password will be available in controllers.

// Without this → req.body would be undefined.


app.use(cookieParser());                             // Allows backend to read cookies sent from the browser.
// In your project, JWT token is stored inside a cookie:   token = xxyyzz...

// cookieParser() makes it accessible as: req.cookies.token
// Without this → middleware userAuth cannot read the token → login would not remain active.






// Allows React frontend (running on port 5173) to communicate with Node backend.
// Browsers normally block cross-origin requests for security.

// origin: "http://localhost:5173" → only your frontend is allowed

// credentials: true → allows cookies to be sent between frontend ↔ backend

// Without this → frontend would get CORS errors and login wouldn’t work.
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:5173"
  ],
  credentials: true
}));




app.use("/uploads", express.static("uploads"));           // Server uploaded images publicly (important for future image previews)







// ------------------- API Routes -------------------
app.get('/', (req, res) => res.send("API Working Very Nicely"));  // Test default route

app.use('/api/auth', authRouter);                 // Handles login, register, OTP, reset password
app.use('/api/user', userRouter);                 // Handles user-related actions (profile etc.)
app.use('/api/plants', plantRouter);              // Handles image upload + ML based plant prediction



// ------------------- Start Server -------------------
app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});
