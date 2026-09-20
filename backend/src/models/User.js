import mongoose from "mongoose";
import { ROLES, USER_STATUS } from "../utils/constants.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT, required: true },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },

    // Login security
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 }, // bump to invalidate old JWTs (logout)
    lastLoginAt: { type: Date, default: null },

    // MFA (used in Phase 16)
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    mfaBackupCodes: { type: [String], select: false }, // store HASHED codes only

    // Only used when role is "student"
    studentProfile: {
      phone: { type: String, trim: true, maxlength: 20 },
      course: { type: String, trim: true, maxlength: 100 },
      yearLevel: { type: Number, min: 1, max: 6 },
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

userSchema.index({ role: 1, status: 1 });

export default model("User", userSchema);