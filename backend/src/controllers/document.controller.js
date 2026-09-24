import { checkDocumentIntegrity } from "../services/integrity.service.js";  
import { listMyDocuments, uploadDocument, replaceDocument } from "../services/document.service.js";
import { toDocumentSummary } from "../utils/serializers.js";
import { openDocumentForReview, reviewDocument } from "../services/document.service.js";
import { toDocumentDetail } from "../utils/serializers.js";

export const getMyDocuments = async (req, res) => {
  const documents = await listMyDocuments(req.user._id);
  res.json({ success: true, data: { documents: documents.map(toDocumentSummary) } });
};

export const upload = async (req, res) => {
  const document = await uploadDocument({
    user: req.user,
    file: req.file,
    requirementId: req.body.requirementId,
    applicationId: req.body.applicationId,
    req,
  });
  res.status(201).json({ success: true, message: "Document uploaded", data: { document: toDocumentSummary(document) } });
};

export const replace = async (req, res) => {
  const document = await replaceDocument({ user: req.user, documentId: req.params.id, file: req.file, req });
  res.json({ success: true, message: "Document replaced", data: { document: toDocumentSummary(document) } });
};

export const verifyIntegrity = async (req, res) => {
  const { document, matched } = await checkDocumentIntegrity({ user: req.user, documentId: req.params.id, req });
  res.json({
    success: true,
    message: matched ? "No changes detected" : "Possible modification detected",
    data: {
      documentId: document._id.toString(),
      matched,
      verificationStatus: document.verificationStatus,
      checkedAt: document.lastIntegrityCheck.checkedAt,
    },
  });
};

export const openForReview = async (req, res) => {
  const { document, integrityMatched } = await openDocumentForReview({ user: req.user, documentId: req.params.id, req });
  res.json({ success: true, data: { document: toDocumentDetail(document), integrityMatched } });
};

export const review = async (req, res) => {
  const document = await reviewDocument({
    user: req.user, documentId: req.params.id, status: req.body.status, remarks: req.body.remarks, req,
  });
  res.json({ success: true, message: `Document ${document.verificationStatus.toLowerCase()}`, data: { document: toDocumentDetail(document) } });
};