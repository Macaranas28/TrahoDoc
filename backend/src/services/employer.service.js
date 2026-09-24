import Employer from "../models/Employer.js";
import Requirement from "../models/Requirement.js";
import Document from "../models/Document.js";
import ApiError from "../utils/ApiError.js";
import {
  ACCREDITATION_STATUS,
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  DOCUMENT_STATUS,
  REQUIREMENT_TARGET,
} from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import { detectRiskFlags } from "./riskFlag.service.js";
import { canViewDocument } from "../utils/access.js"; // not required here, kept for symmetry if needed later


// Only the fields a student needs. No email, phone, contact person, or risk flags.
export const getAccreditedEmployers = () =>
  Employer.find({ accreditationStatus: ACCREDITATION_STATUS.ACCREDITED })
    .select("companyName businessInformation")
    .sort({ companyName: 1 })
    .limit(100);

export const getOrNull = (ownerUserId) => Employer.findOne({ ownerUserId });

export const requireEmployerRecord = async (ownerUserId) => {
  const employer = await getOrNull(ownerUserId);
  if (!employer) throw ApiError.notFound("Company profile not found. Please create it first.");
  return employer;
};

export const upsertEmployerProfile = async ({ user, companyName, contactPerson, phone, address, industry, website, description, req }) => {
  const employer = await Employer.findOneAndUpdate(
    { ownerUserId: user._id },
    {
      $set: {
        companyName,
        contactPerson,
        phone,
        email: user.email, // always mirrors the login email; never taken from the form
        "businessInformation.address": address,
        "businessInformation.industry": industry,
        "businessInformation.website": website,
        "businessInformation.description": description,
      },
      $setOnInsert: { accreditationStatus: ACCREDITATION_STATUS.PENDING },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.EMPLOYER_PROFILE_UPDATED,
    module: AUDIT_MODULES.EMPLOYERS,
    targetId: employer._id,
  });
  return employer;
};

export const submitEmployerForReview = async ({ user, req }) => {
  const employer = await requireEmployerRecord(user._id);

  if (employer.accreditationStatus !== ACCREDITATION_STATUS.PENDING) {
    throw ApiError.conflict(`Cannot submit while status is "${employer.accreditationStatus}"`);
  }

  const requiredDocs = await Requirement.find({
    appliesTo: REQUIREMENT_TARGET.EMPLOYER,
    isActive: true,
    isRequired: true,
  }).select("_id");

  const uploadedCount = await Document.countDocuments({
    employerId: employer._id,
    requirementId: { $in: requiredDocs.map((r) => r._id) },
    verificationStatus: { $ne: DOCUMENT_STATUS.REJECTED },
  });

  if (uploadedCount < requiredDocs.length) {
    throw ApiError.badRequest(
      `Please upload all required documents first (${uploadedCount}/${requiredDocs.length} uploaded)`
    );
  }

  employer.accreditationStatus = ACCREDITATION_STATUS.UNDER_REVIEW;
  await employer.save();

  await logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.EMPLOYER_SUBMITTED_FOR_REVIEW,
    module: AUDIT_MODULES.EMPLOYERS,
    targetId: employer._id,
  });
  return employer;
};

export const listEmployersForCoordinator = async ({ status }) => {
  const filter = status ? { accreditationStatus: status } : {};
  return Employer.find(filter).select("companyName email phone accreditationStatus riskFlags createdAt").sort({ createdAt: -1 });
};

export const getEmployerForReview = async (employerId) => {
  const employer = await Employer.findById(employerId);
  if (!employer) throw ApiError.notFound("Employer not found");

  const duplicatePhoneExists = await Employer.exists({ _id: { $ne: employer._id }, phone: employer.phone });
  const newFlags = await detectRiskFlags(employer, { duplicatePhoneExists: Boolean(duplicatePhoneExists) });
  if (newFlags.length > 0) {
    employer.riskFlags.push(...newFlags);
    await employer.save();
  }

  const documents = await Document.find({ employerId: employer._id })
    .select("documentType originalFileName verificationStatus verifiedAt");
  return { employer, documents };
};

export const decideAccreditation = async ({ employerId, status, remarks, coordinator, req }) => {
  const employer = await Employer.findById(employerId);
  if (!employer) throw ApiError.notFound("Employer not found");

  if (employer.accreditationStatus !== ACCREDITATION_STATUS.UNDER_REVIEW) {
    throw ApiError.conflict(`Cannot decide while status is "${employer.accreditationStatus}"`);
  }

  if (status === ACCREDITATION_STATUS.ACCREDITED) {
    const requiredDocs = await Requirement.find({ appliesTo: "employer", isActive: true, isRequired: true }).select("_id");
    const docs = await Document.find({ employerId: employer._id, requirementId: { $in: requiredDocs.map((r) => r._id) } });
    const allVerified = requiredDocs.every((req) =>
      docs.some((d) => d.requirementId.toString() === req._id.toString() && d.verificationStatus === "Verified")
    );
    if (!allVerified) throw ApiError.badRequest("All required documents must be Verified before accrediting this employer");
  }

  employer.accreditationStatus = status;
  employer.accreditationRemarks = remarks;
  employer.accreditedBy = coordinator._id;
  employer.accreditedAt = new Date();
  await employer.save();

  await logAction({
    req, userId: coordinator._id, actorEmail: coordinator.email,
    action: AUDIT_ACTIONS.EMPLOYER_ACCREDITATION_DECIDED, module: AUDIT_MODULES.EMPLOYERS,
    targetId: employer._id, details: `Decision: ${status}`,
  });

  const owner = await User.findById(employer.ownerUserId);
  if (owner) {
    await notifyUser({
      userId: owner._id,
      category: "accreditation",
      message: `Your company's accreditation was ${status === "Accredited" ? "approved" : "rejected"}.${remarks ? ` Remarks: ${remarks}` : ""}`,
      link: "/employer/accreditation",
    });
  }
  return employer;
};

export const reviewRiskFlag = async ({ employerId, flagId, status, reviewNote, coordinator, req }) => {
  const employer = await Employer.findOneAndUpdate(
    { _id: employerId, "riskFlags._id": flagId },
    {
      $set: {
        "riskFlags.$.status": status,
        "riskFlags.$.reviewNote": reviewNote,
        "riskFlags.$.reviewedBy": coordinator._id,
        "riskFlags.$.reviewedAt": new Date(),
      },
    },
    { new: true }
  );
  if (!employer) throw ApiError.notFound("Employer or risk flag not found");

  await logAction({
    req, userId: coordinator._id, actorEmail: coordinator.email,
    action: AUDIT_ACTIONS.RISK_FLAG_REVIEWED, module: AUDIT_MODULES.EMPLOYERS,
    targetId: employer._id, details: `Flag ${flagId} marked ${status}: ${reviewNote}`,
  });
  return employer;
};