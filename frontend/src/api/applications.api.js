import api from "./axios.js";

export const createApplication = (employerId) => api.post("/applications", { employerId });
export const getMyApplications = () => api.get("/applications/mine");
export const getApplication = (id) => api.get(`/applications/${id}`);
export const submitApplication = (id) => api.patch(`/applications/${id}/submit`);
export const withdrawApplication = (id, remarks) => api.patch(`/applications/${id}/withdraw`, { remarks });
export const getEmployerApplications = () => api.get("/applications");
export const getEmployerApplication = (id) => api.get(`/applications/${id}`);
export const respondToApplication = (id, status, remarks) =>
  api.patch(`/applications/${id}/employer-response`, { status, remarks });