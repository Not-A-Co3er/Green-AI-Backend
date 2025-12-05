// Models/plantPredictionModel.js
import mongoose from "mongoose";

const plantPredictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // who made the request
    imagePath: { type: String, required: true },      // path of saved image
    inputType: { type: String, enum: ["leaf", "flower"], required: true }, // what user selected
    plantName: { type: String },                      // predicted plant type
    disease: { type: String },                        // predicted disease (if any)
    confidence: { type: Number },                     // e.g. 0.92 = 92% sure
  },
  { timestamps: true } // adds createdAt, updatedAt automatically
);

const plantPredictionModel =
  mongoose.models.plantPrediction ||
  mongoose.model("plantPrediction", plantPredictionSchema);

export default plantPredictionModel;
