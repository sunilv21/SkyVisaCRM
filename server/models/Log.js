import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    note: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { 
      type: String, 
      enum: ["call", "email", "meeting", "note"],
      default: "note"
    },
    subject: { type: String },
    outcome: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral"
    },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: String }, // Store as ISO date string
    duration: { type: Number }, // in minutes
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
