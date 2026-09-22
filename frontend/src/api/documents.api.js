import api from "./axios.js";

export const getMyDocuments = () => api.get("/documents/mine");