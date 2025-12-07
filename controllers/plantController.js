// controllers/plantController.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import plantPredictionModel from "../models/plantPredictionModel.js";

// POST /api/plant/analyze
export const analyzePlant = async (req, res) => {
  try {
    const userId = req.user; // set by userAuth middleware

    // Check for uploaded file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const imagePath = req.file.path;

    // 1️⃣ Send uploaded image to ML model deployed on Render
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath)); // key must match ML API requirement

    const mlResponse = await axios.post(
      "https://major-apiintergration-model.onrender.com/predict",
      form,
      { headers: form.getHeaders() }
    );

    const { predicted_class, confidence } = mlResponse.data;

    // 2️⃣ Save prediction to database
    const savedPrediction = await plantPredictionModel.create({
      user: userId,
      plantName: predicted_class,
      confidence,
      imagePath,
      createdAt: new Date()
    });

    // 3️⃣ Respond to frontend
    return res.json({
      success: true,
      message: "Plant identified successfully",
      data: {
        id: savedPrediction._id,
        plantName: predicted_class,
        confidence,
        imagePath,
      }
    });

  } catch (error) {
    console.error("analyzePlant error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze plant image",
      error: error?.response?.data || error.message,
    });
  }
};

// GET /api/plant/history
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
    console.error("getUserPredictions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
