import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    countryCode: { type: String },
    company: { type: String },
    status: {
      type: String,
      enum: ["active", "Dead", "prospect", "new", "confirmed", "travelling", "completed"],
      default: "prospect",
    },
    isTravelling: { type: Boolean, default: false },
    travellingStartDate: { type: String },
    assignedEmployeeId: { type: String },
    assignedEmployeeName: { type: String },
    lastContact: { type: String },
    
    // Personal Information
    dob: { type: String },
    gender: { type: String },
    nationality: { type: String },
    
    // Travel Details
    destination: { type: String },
    purpose: { type: String },
    travelFrom: { type: String },
    travelTo: { type: String },
    budget: { type: String },
    travelType: { type: String },
    hotel: { type: String },
    service: { type: String },
    
    // Additional Services
    insurance: { type: Boolean, default: false },
    pickup: { type: Boolean, default: false },
    tours: { type: Boolean, default: false },
    
    // Other Information
    previousVisits: { type: String },
    passportNumber: { type: String },
    passportExpiry: { type: String },
    visaStatus: { type: String },
    emergencyContact: { type: String },
    emergencyPhone: { type: String },
    specialRequirements: { type: String },
    
    // Group Travelers
    groupTravelers: { type: [String], default: [] },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
