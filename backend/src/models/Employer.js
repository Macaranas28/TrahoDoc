import mongoose from "mongoose";
import {
  ACCREDITATION_STATUS,
  RISK_FLAG_CODES,
  RISK_SEVERITY,
  RISK_FLAG_STATUS,
} from "../utils/constants.js";

const { Schema, model } = mongoose;

// Each flag keeps its own _id so a coordinator can dismiss one flag later.
const riskFlagSchema = new Schema(
  {
    code: { type: String, enum: Object.values(RISK_FLAG_CODES), required: true },
    message: { type: String, required: true, maxlength: 300 },
    severity: { type: String, enum: Object.values(RISK_SEVERITY), default: RISK_SEVERITY.LOW },
    status: { type: String, enum: Object.values(RISK_FLAG_STATUS), default: RISK_FLAG_STATUS.OPEN },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const employerSchema = new Schema(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: [true, "Company name is required"], trim: true, minlength: 2, maxlength: 150 },
    contactPerson: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+()\-\s]{7,20}$/, "Invalid phone number"],
    },
    businessInformation: {
      address: { type: String, trim: true, maxlength: 250 },
      industry: { type: String, trim: true, maxlength: 100 },
      website: { type: String, trim: true, maxlength: 200 },
      description: { type: String, trim: true, maxlength: 1000 },
    },
    accreditationStatus: {
      type: String,
      enum: Object.values(ACCREDITATION_STATUS),
      default: ACCREDITATION_STATUS.PENDING,
    },
    accreditationRemarks: { type: String, trim: true, maxlength: 500 },
    accreditedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    accreditedAt: { type: Date, default: null },
    riskFlags: { type: [riskFlagSchema], default: [] },
  },
  { timestamps: true }
);

employerSchema.index({ accreditationStatus: 1 });
employerSchema.index({ companyName: 1 });
employerSchema.index({ phone: 1 }); // helps detect duplicate phone numbers

export default model("Employer", employerSchema);