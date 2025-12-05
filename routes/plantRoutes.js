// routes/plantRoutes.js
import express from "express";
import multer from "multer";
import userAuth from "../middleware/userAuth.js";
import { analyzePlant, getUserPredictions } from "../controllers/plantController.js";

const plantRouter = express.Router();

// Configure multer storage (save images to /uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder in Server root (make sure it exists)
  },
  filename: function (req, file, cb) {
    // e.g. 1700000000-originalName.jpg
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Analyze a plant image
// expects: form-data with "image" file and "inputType" = 'leaf' or 'flower'
plantRouter.post(
  "/analyze",
  userAuth,                 // must be logged in
  upload.single("image"),   // file field name = "image"
  analyzePlant
);

// Get history of predictions for logged-in user
plantRouter.get("/history", userAuth, getUserPredictions);

export default plantRouter;
