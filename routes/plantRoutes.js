// routes/plantRoutes.js
import express from "express";
import multer from "multer";
import userAuth from "../middleware/userAuth.js";
import { analyzePlant, getUserPredictions } from "../controllers/plantController.js";

const plantRouter = express.Router();

// Configure multer storage (save images to /uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // folder in project root
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Analyze a plant image
plantRouter.post(
  "/analyze",
  userAuth,
  upload.single("image"),   // image key must be "image"
  analyzePlant
);

// History of predictions
plantRouter.get("/history", userAuth, getUserPredictions);

export default plantRouter;
