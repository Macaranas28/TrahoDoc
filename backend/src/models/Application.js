import mongoose from "mongoose";
import { APPLICATION_STATUS, EMPLOYER_RESPONSE } from "../utils/constants.js";

const { Schema, model } = mongoose;

const checklistItemSchema = new Schema(
  {
    requirementId: { type: Schema.Types.ObjectId, ref: "Requirement", required: true },
    name: { type: String, required: true, maxlength: 150 }, // copy of the requirement name
    documentId: { type: Schema.Types.ObjectId, ref: "Document", default: null },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: Object.values(APPLICATION_STATUS), required: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "Employer", required: true },
    assignedCoordinatorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.DRAFT },
    submittedAt: { type: Date, default: null },
    requiredDocuments: { type: [checklistItemSchema], default: [] },
    statusHistory: { type: [statusHistorySchema], default: [] },
    employerResponse: {
      status: { type: String, enum: Object.values(EMPLOYER_RESPONSE), default: EMPLOYER_RESPONSE.PENDING },
      remarks: { type: String, trim: true, maxlength: 500 },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ employerId: 1, status: 1 });
applicationSchema.index({ assignedCoordinatorId: 1, status: 1 });

export default model("Application", applicationSchema);