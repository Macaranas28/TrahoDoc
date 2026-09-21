import { listMyDocuments } from "../services/document.service.js";
import { toDocumentSummary } from "../utils/serializers.js";

export const getMyDocuments = async (req, res) => {
  const documents = await listMyDocuments(req.user._id);
  res.json({ success: true, data: { documents: documents.map(toDocumentSummary) } });
};