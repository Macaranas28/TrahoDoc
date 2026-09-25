import api from "./axios.js";

export const getMyDocuments = () => api.get("/documents/mine");

export const uploadDocument = ({ file, requirementId, applicationId }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("requirementId", requirementId);
  if (applicationId) formData.append("applicationId", applicationId);

  // Let the browser set the multipart boundary itself — do NOT set Content-Type manually
  return api.post("/documents", formData);
};

export const replaceDocument = (documentId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.put(`/documents/${documentId}`, formData);
};

export const openDocumentForReview = (id) => api.get(`/documents/${id}/review`);
export const reviewDocument = (id, status, remarks) => api.patch(`/documents/${id}/review`, { status, remarks });
export const verifyDocumentIntegrity = (id) => api.post(`/documents/${id}/verify-integrity`);