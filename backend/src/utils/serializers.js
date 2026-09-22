import { DOCUMENT_STATUS } from "./constants.js";

const idOf = (value) => (value?._id ?? value)?.toString();

const lastRemarks = (doc) =>
  doc.verificationStatus === DOCUMENT_STATUS.REJECTED ? doc.verificationHistory?.at(-1)?.remarks : undefined;

export const toApplicationSummary = (a) => ({
  id: a._id.toString(),
  status: a.status,
  employer: { id: idOf(a.employerId), companyName: a.employerId?.companyName },
  submittedAt: a.submittedAt,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

const toChecklistItem = (item) => {
  const doc = item.documentId; // a populated Document, or null when nothing was uploaded
  if (!doc) {
    return { requirementId: idOf(item.requirementId), name: item.name, status: "Missing", document: null };
  }
  return {
    requirementId: idOf(item.requirementId),
    name: item.name,
    status: doc.verificationStatus,
    document: {
      id: doc._id.toString(),
      fileName: doc.originalFileName,
      verifiedAt: doc.verifiedAt,
      remarks: lastRemarks(doc),
    },
  };
};

export const toApplicationDetail = (a) => ({
  ...toApplicationSummary(a),
  employerResponse: { status: a.employerResponse?.status, remarks: a.employerResponse?.remarks },
  checklist: a.requiredDocuments.map(toChecklistItem),
  timeline: a.statusHistory.map((h) => ({ status: h.status, remarks: h.remarks, changedAt: h.changedAt })),
});

export const toDocumentSummary = (d) => ({
  id: d._id.toString(),
  applicationId: idOf(d.applicationId),
  documentType: d.documentType,
  fileName: d.originalFileName,
  status: d.verificationStatus,
  remarks: lastRemarks(d),
  uploadedAt: d.createdAt,
});

export const toEmployerApplicationView = (a) => ({
  id: a._id.toString(),
  status: a.status,
  student: { name: a.studentId?.name, course: a.studentId?.studentProfile?.course },
  employerResponse: a.employerResponse,
  createdAt: a.createdAt,
});