import { getAccreditedEmployers, getOrNull, upsertEmployerProfile, submitEmployerForReview } from "../services/employer.service.js";
import ApiError from "../utils/ApiError.js";

const toProfileView = (e) => ({
  id: e._id.toString(),
  companyName: e.companyName,
  contactPerson: e.contactPerson,
  email: e.email,
  phone: e.phone,
  businessInformation: e.businessInformation,
  accreditationStatus: e.accreditationStatus,
  accreditationRemarks: e.accreditationRemarks,
});

export const getMyEmployerProfile = async (req, res) => {
  const employer = await getOrNull(req.user._id);
  if (!employer) {
    return res.json({ success: true, data: { profile: null } }); // not created yet: not an error
  }
  res.json({ success: true, data: { profile: toProfileView(employer) } });
};

export const updateMyEmployerProfile = async (req, res) => {
  const { companyName, contactPerson, phone, address, industry, website, description } = req.body;
  const employer = await upsertEmployerProfile({
    user: req.user, companyName, contactPerson, phone, address, industry, website, description, req,
  });
  res.json({ success: true, message: "Company profile saved", data: { profile: toProfileView(employer) } });
};

export const submitMyEmployerForReview = async (req, res) => {
  const employer = await submitEmployerForReview({ user: req.user, req });
  res.json({ success: true, message: "Submitted for review", data: { profile: toProfileView(employer) } });
};

export const getAccreditedEmployersList = async (req, res) => {
  const employers = await getAccreditedEmployers();
  res.json({
    success: true,
    data: {
      employers: employers.map((e) => ({
        id: e._id.toString(),
        companyName: e.companyName,
        industry: e.businessInformation?.industry,
        address: e.businessInformation?.address,
        website: e.businessInformation?.website,
        description: e.businessInformation?.description,
      })),
    },
  });
};

import {
  listEmployersForCoordinator, getEmployerForReview, decideAccreditation, reviewRiskFlag,
} from "../services/employer.service.js";

const toCoordinatorListView = (e) => ({
  id: e._id.toString(),
  companyName: e.companyName,
  email: e.email,
  phone: e.phone,
  accreditationStatus: e.accreditationStatus,
  openFlagCount: e.riskFlags.filter((f) => f.status === "open").length,
  createdAt: e.createdAt,
});

export const getEmployersForCoordinator = async (req, res) => {
  const employers = await listEmployersForCoordinator({ status: req.query.status });
  res.json({ success: true, data: { employers: employers.map(toCoordinatorListView) } });
};

export const getEmployerDetail = async (req, res) => {
  const { employer, documents } = await getEmployerForReview(req.params.id);
  res.json({
    success: true,
    data: {
      employer: {
        id: employer._id.toString(),
        companyName: employer.companyName,
        contactPerson: employer.contactPerson,
        email: employer.email,
        phone: employer.phone,
        businessInformation: employer.businessInformation,
        accreditationStatus: employer.accreditationStatus,
        accreditationRemarks: employer.accreditationRemarks,
        riskFlags: employer.riskFlags.map((f) => ({
          id: f._id.toString(), code: f.code, message: f.message, severity: f.severity,
          status: f.status, reviewNote: f.reviewNote,
        })),
      },
      documents: documents.map((d) => ({
        id: d._id.toString(), documentType: d.documentType, fileName: d.originalFileName,
        status: d.verificationStatus, verifiedAt: d.verifiedAt,
      })),
    },
  });
};

export const decideEmployerAccreditation = async (req, res) => {
  const employer = await decideAccreditation({
    employerId: req.params.id, status: req.body.status, remarks: req.body.remarks, coordinator: req.user, req,
  });
  res.json({ success: true, message: "Decision recorded", data: { accreditationStatus: employer.accreditationStatus } });
};

export const reviewEmployerRiskFlag = async (req, res) => {
  const employer = await reviewRiskFlag({
    employerId: req.params.id, flagId: req.params.flagId,
    status: req.body.status, reviewNote: req.body.reviewNote, coordinator: req.user, req,
  });
  res.json({ success: true, message: "Flag reviewed", data: { riskFlags: employer.riskFlags } });
};