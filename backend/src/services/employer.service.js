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