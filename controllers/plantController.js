// controllers/plantController.js
import axios from "axios";
import plantPredictionModel from "../Models/plantPredictionModel.js";
//import userModel from "../Models/userModel.js"; // optional if you want extra checks

// POST /api/plants/analyze
export const analyzePlant = async (req, res) => {
  try {
    // userAuth middleware already set req.user = userId
    const userId = req.user;

    // multer stored the file info in req.file
    if (!req.file) {
      return res.json({ success: false, message: "Image file is required" });
    }

    const { inputType } = req.body; // 'leaf' or 'flower'

    if (!inputType || !["leaf", "flower"].includes(inputType)) {
      return res.json({
        success: false,
        message: "inputType must be 'leaf' or 'flower'",
      });
    }

    const imagePath = req.file.path; // local path where image is saved

    // ---------- CALL ML / AI SERVICE HERE ----------
    // This is a placeholder. Your friend will give you the ML endpoint.
    // Example: POST to Python server with image.
    let plantName = "Unknown Plant";
    let disease = "Healthy";
    let confidence = 0.8;

    // Example call if friend exposes HTTP API:
    // const mlResponse = await axios.post(
    //   "http://localhost:5001/predict",
    //   { imagePath, inputType }
    // );
    // const { plantName, disease, confidence } = mlResponse.data;

    // ---------- SAVE RESULT IN DATABASE ----------
    const prediction = await plantPredictionModel.create({
      user: userId,
      imagePath,
      inputType,
      plantName,
      disease,
      confidence,
    });

    return res.json({
      success: true,
      message: "Analysis completed",
      data: {
        id: prediction._id,
        plantName,
        disease,
        confidence,
        inputType,
        imagePath,
      },
    });
  } catch (error) {
    console.error("analyzePlant error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/plants/history
export const getUserPredictions = async (req, res) => {
  try {
    const userId = req.user;

    const predictions = await plantPredictionModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
