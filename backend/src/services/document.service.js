import mongoose from "mongoose";
import Document from "../models/Document.js";
import Application from "../models/Application.js";
import Employer from "../models/Employer.js";
import Requirement from "../models/Requirement.js";
import ApiError from "../utils/ApiError.js";
import { sha256Hex } from "../utils/hash.js";
import { assertValidUpload, uploadBufferToCloudinary, deleteFromCloudinary } from "./upload.service.js";
import { canViewApplication } from "../utils/access.js";
import {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  DOCUMENT_STATUS,
  REQUIREMENT_TARGET,
  ROLES,
} from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import { notifyUser } from "./notification.service.js";

// Never sends the file link or hash here. Secure file access comes with signed URLs, added below.
export const listMyDocuments = (userId) =>
  Document.find({ ownerId: userId })
    .select("applicationId documentType originalFileName verificationStatus verificationHistory createdAt")
    .sort({ createdAt: -1 })
    .limit(200);

// Confirms the requirement exists and matches the uploader's role, and (for students) that
// the application belongs to them and the requirement is actually part of its checklist.
const resolveUploadTarget = async ({ user, requirementId, applicationId }) => {
  const requirement = await Requirement.findOne({ _id: requirementId, isActive: true });
  if (!requirement) throw ApiError.notFound("Requirement not found");

  if (user.role === ROLES.STUDENT) {
    if (requirement.appliesTo !== REQUIREMENT_TARGET.STUDENT) {
      throw ApiError.badRequest("This requirement is not for students");
    }
    if (!applicationId) throw ApiError.badRequest("applicationId is required for students");

    const application = await Application.findById(applicationId);
    if (!application || !canViewApplication({ user, application })) {
      throw ApiError.notFound("Application not found");
    }
    const onChecklist = application.requiredDocuments.some((d) => d.requirementId.toString() === requirementId);
    if (!onChecklist) throw ApiError.badRequest("This requirement is not part of your application checklist");

    return { requirement, application, employer: null, folder: `trahodoc/applications/${application._id}` };
  }

  if (user.role === ROLES.EMPLOYER) {
    if (requirement.appliesTo !== REQUIREMENT_TARGET.EMPLOYER) {
      throw ApiError.badRequest("This requirement is not for employers");
    }
    const employer = await Employer.findOne({ ownerUserId: user._id });
    if (!employer) throw ApiError.badRequest("Please create your company profile first");

    return { requirement, application: null, employer, folder: `trahodoc/employers/${employer._id}` };
  }

  throw ApiError.forbidden(); // should be unreachable given the route's requireRole
};

export const uploadDocument = async ({ user, file, requirementId, applicationId, req }) => {
  assertValidUpload(file); // magic-byte check: catches a renamed/fake file type

  const { requirement, application, employer, folder } = await resolveUploadTarget({ user, requirementId, applicationId });

  const fileHash = sha256Hex(file.buffer);
  const uploadResult = await uploadBufferToCloudinary(file.buffer, { folder, mimeType: file.mimetype });

  const document = await Document.create({
    ownerId: user._id,
    applicationId: application?._id,
    employerId: employer?._id,
    requirementId: requirement._id,
    documentType: requirement.name,
    originalFileName: file.originalname.slice(0, 255),
    fileUrl: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    fileHash,
    verificationStatus: DOCUMENT_STATUS.PENDING,
    verificationHistory: [{ status: DOCUMENT_STATUS.PENDING, remarks: "Uploaded", actionBy: user._id }],
  });

  // Link the new document into the application's checklist snapshot
  if (application) {
    await Application.updateOne(
      { _id: application._id, "requiredDocuments.requirementId": requirement._id },
      { $set: { "requiredDocuments.$.documentId": document._id } }
    );
  }

  await logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
    module: AUDIT_MODULES.DOCUMENTS,
    targetId: document._id,
    details: `Uploaded ${requirement.name}`,
  });

  return document;
};

// Replacing a rejected/pending document: deletes the old file, keeps the same requirement slot
export const replaceDocument = async ({ user, documentId, file, req }) => {
  const existing = await Document.findOne({ _id: documentId, ownerId: user._id });
  if (!existing) throw ApiError.notFound("Document not found");
  if (existing.verificationStatus === DOCUMENT_STATUS.VERIFIED) {
    throw ApiError.conflict("A verified document cannot be replaced");
  }

  assertValidUpload(file);
  const resourceType = existing.mimeType === "application/pdf" ? "raw" : "image";
  await deleteFromCloudinary(existing.cloudinaryPublicId, resourceType);

  const folder = existing.applicationId
    ? `trahodoc/applications/${existing.applicationId}`
    : `trahodoc/employers/${existing.employerId}`;
  const uploadResult = await uploadBufferToCloudinary(file.buffer, { folder, mimeType: file.mimetype });

  existing.originalFileName = file.originalname.slice(0, 255);
  existing.fileUrl = uploadResult.secure_url;
  existing.cloudinaryPublicId = uploadResult.public_id;
  existing.mimeType = file.mimetype;
  existing.sizeBytes = file.size;
  existing.fileHash = sha256Hex(file.buffer);
  existing.verificationStatus = DOCUMENT_STATUS.PENDING;
  existing.verifiedBy = null;
  existing.verifiedAt = null;
  existing.verificationHistory.push({ status: DOCUMENT_STATUS.PENDING, remarks: "Replaced", actionBy: user._id });
  await existing.save();

  await logAction({
    req, userId: user._id, actorEmail: user.email,
    action: AUDIT_ACTIONS.DOCUMENT_UPLOADED, module: AUDIT_MODULES.DOCUMENTS,
    targetId: existing._id, details: "Document replaced",
  });
  return existing;
};