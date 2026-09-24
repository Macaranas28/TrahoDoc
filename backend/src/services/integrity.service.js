import Document from "../models/Document.js";
import Application from "../models/Application.js";
import ApiError from "../utils/ApiError.js";
import { sha256Hex } from "../utils/hash.js";
import { generateAuthenticatedUrl, downloadFileBuffer } from "./upload.service.js";
import { canViewDocument } from "../utils/access.js";
import { AUDIT_ACTIONS, AUDIT_MODULES, DOCUMENT_STATUS, NOTIFICATION_CATEGORIES } from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import { notifyUser } from "./notification.service.js";

// Loads the document AND checks the coordinator is allowed to see it
// (assigned coordinator for student docs, any coordinator for employer accreditation docs)
const findCheckableDocument = async (user, documentId) => {
  const document = await Document.findById(documentId);
  if (!document) throw ApiError.notFound("Document not found");

  const application = document.applicationId ? await Application.findById(document.applicationId) : null;
  if (!canViewDocument({ user, document, application })) {
    throw ApiError.notFound("Document not found");
  }
  return document;
};

export const checkDocumentIntegrity = async ({ user, documentId, req }) => {
  const document = await findCheckableDocument(user, documentId);

  const resourceType = document.mimeType === "application/pdf" ? "raw" : "image";
  const signedUrl = generateAuthenticatedUrl(document.cloudinaryPublicId, resourceType);

  console.log("Integrity check — signed URL:", signedUrl);
  let buffer;
  try {
    buffer = await downloadFileBuffer(signedUrl);
  } catch (error) {
    console.error("Integrity check — download error:", error);
    throw ApiError.badRequest(`Could not retrieve the file for checking: ${error.message}`);
  }

  const currentHash = sha256Hex(buffer);
  const matched = currentHash === document.fileHash;

  document.lastIntegrityCheck = { checkedAt: new Date(), matched, checkedBy: user._id };

  // Only escalate on mismatch — a matching check should never downgrade an existing status
  if (!matched && document.verificationStatus !== DOCUMENT_STATUS.POSSIBLE_MODIFICATION) {
    document.verificationStatus = DOCUMENT_STATUS.POSSIBLE_MODIFICATION;
    document.verificationHistory.push({
      status: DOCUMENT_STATUS.POSSIBLE_MODIFICATION,
      remarks: "Automated integrity check found the file no longer matches its original hash",
      actionBy: user._id,
    });
  }
  await document.save();

  await logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.DOCUMENT_INTEGRITY_CHECKED,
    module: AUDIT_MODULES.DOCUMENTS,
    targetId: document._id,
    result: matched ? "success" : "failure",
    details: matched ? "Hash matched" : "Hash mismatch detected",
  });

  if (!matched) {
    await notifyUser({
      userId: document.ownerId,
      category: NOTIFICATION_CATEGORIES.DOCUMENT,
      message: `A possible modification was detected on your document "${document.documentType}". A coordinator will review it.`,
    });
  }

  return { document, matched };
};