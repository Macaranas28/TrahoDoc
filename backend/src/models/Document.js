import mongoose from "mongoose";
import { DOCUMENT_STATUS, UPLOAD_RULES } from "../utils/constants.js";

const { Schema, model } = mongoose;

const historySchema = new Schema(
  {
    status: { type: String, enum: Object.values(DOCUMENT_STATUS), required: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    actionBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // null = system
    actionAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // the uploader
      validate: {
        // exactly ONE of applicationId / employerId must be set
        validator: function () {
          return Boolean(this.applicationId) !== Boolean(this.employerId);
        },
        message: "A document must belong to exactly one application OR one employer",
      },
    },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    employerId: { type: Schema.Types.ObjectId, ref: "Employer" },
    requirementId: { type: Schema.Types.ObjectId, ref: "Requirement" },

    documentType: { type: String, required: true, trim: true, maxlength: 100 },
    originalFileName: { type: String, required: true, trim: true, maxlength: 255 },
    fileUrl: { type: String, required: true, maxlength: 500 },
    cloudinaryPublicId: { type: String, required: true, maxlength: 255 },
    mimeType: { type: String, required: true, enum: UPLOAD_RULES.ALLOWED_MIME_TYPES },
    sizeBytes: { type: Number, required: true, min: 1, max: UPLOAD_RULES.MAX_SIZE_BYTES },

    // SHA-256 in hex is always 64 characters (0-9, a-f)
    fileHash: { type: String, required: true, match: [/^[a-f0-9]{64}$/, "Invalid SHA-256 hash"] },
    lastIntegrityCheck: {
      checkedAt: { type: Date },
      matched: { type: Boolean },
      checkedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },

    verificationStatus: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    verificationHistory: { type: [historySchema], default: [] },
  },
  { timestamps: true }
);

documentSchema.index({ applicationId: 1 });
documentSchema.index({ employerId: 1 });
documentSchema.index({ ownerId: 1 });
documentSchema.index({ verificationStatus: 1, createdAt: -1 });
documentSchema.index({ fileHash: 1 }); // not unique: same hash on different accounts can be a review signal

export default model("Document", documentSchema);