import api from "./axios.js";

export const getAccreditedEmployers = () => api.get("/employers/accredited");
export const getMyEmployerProfile = () => api.get("/employers/me");
export const updateMyEmployerProfile = (data) => api.put("/employers/me", data);
export const submitForReview = () => api.post("/employers/me/submit");
export const uploadEmployerDocument = ({ file, requirementId }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("requirementId", requirementId);
  return api.post("/documents", formData);
};
export const getCoordinatorEmployers = (status) => api.get("/employers", { params: status ? { status } : {} });
export const getEmployerDetail = (id) => api.get(`/employers/${id}`);
export const decideEmployerAccreditation = (id, status, remarks) => api.patch(`/employers/${id}/accreditation`, { status, remarks });
export const reviewRiskFlag = (employerId, flagId, status, reviewNote) =>
  api.patch(`/employers/${employerId}/risk-flags/${flagId}`, { status, reviewNote });