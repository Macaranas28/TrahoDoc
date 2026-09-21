import Document from "../models/Document.js";

// Never sends the file link or hash here. Secure file access comes in Phase 11.
export const listMyDocuments = (userId) =>
  Document.find({ ownerId: userId })
    .select("applicationId documentType originalFileName verificationStatus verificationHistory createdAt")
    .sort({ createdAt: -1 })
    .limit(200);