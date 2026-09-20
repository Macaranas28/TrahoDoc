import mongoose from "mongoose";
import { REQUIREMENT_TARGET } from "../utils/constants.js";

const { Schema, model } = mongoose;

const requirementSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 500 },
    appliesTo: { type: String, enum: Object.values(REQUIREMENT_TARGET), required: true },
    isRequired: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

requirementSchema.index({ name: 1, appliesTo: 1 }, { unique: true });

export default model("Requirement", requirementSchema);