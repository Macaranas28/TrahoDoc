import { requireEmployerRecord } from "./employer.service.js";  
import Application from "../models/Application.js";
import Employer from "../models/Employer.js";
import Requirement from "../models/Requirement.js";
import ApiError from "../utils/ApiError.js";
import { canViewApplication } from "../utils/access.js";
import {
  ACCREDITATION_STATUS,
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  EMPLOYER_RESPONSE,
  NOTIFICATION_CATEGORIES,
  REQUIREMENT_TARGET,
  STUDENT_CAN_SUBMIT_FROM,
  STUDENT_CAN_WITHDRAW_FROM,
} from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import { notifyUser } from "./notification.service.js";
import { isProfileComplete } from "./student.service.js";

const DETAIL_POPULATE = [
  { path: "employerId", select: "companyName" },
  { path: "requiredDocuments.documentId", select: "originalFileName verificationStatus verifiedAt verificationHistory" },
];

const populateDetail = (application) => application.populate(DETAIL_POPULATE);

const audit = (req, user, action, application, details) =>
  logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action,
    module: AUDIT_MODULES.APPLICATIONS,
    targetId: application._id,
    details,
  });

// Record-level check (BOLA). "Missing" and "not yours" give the same answer.
const findOwnedApplication = async (user, id) => {
  const application = await Application.findById(id);
  if (!application || !canViewApplication({ user, application })) {
    throw ApiError.notFound("Application not found");
  }
  return application;
};

export const createDraftApplication = async ({ user, employerId, req }) => {
  if (!isProfileComplete(user)) {
    throw ApiError.badRequest("Please complete your profile before applying");
  }

  const employer = await Employer.findOne({
    _id: employerId,
    accreditationStatus: ACCREDITATION_STATUS.ACCREDITED,
  }).select("companyName");
  if (!employer) throw ApiError.notFound("Employer not found");

  if (await Application.exists({ studentId: user._id, status: { $in: ACTIVE_APPLICATION_STATUSES } })) {
    throw ApiError.conflict("You already have an active application");
  }

  const requirements = await Requirement.find({
    appliesTo: REQUIREMENT_TARGET.STUDENT,
    isActive: true,
    isRequired: true,
  }).sort({ name: 1 });

  const application = await Application.create({
    studentId: user._id,
    employerId: employer._id,
    status: APPLICATION_STATUS.DRAFT,
    requiredDocuments: requirements.map((r) => ({ requirementId: r._id, name: r.name, documentId: null })),
    statusHistory: [{ status: APPLICATION_STATUS.DRAFT, changedBy: user._id }],
  });

  await audit(req, user, AUDIT_ACTIONS.APPLICATION_CREATED, application, `Draft created for ${employer.companyName}`);
  return populateDetail(application);
};

export const listMyApplications = (user) =>
  Application.find({ studentId: user._id }).populate("employerId", "companyName").sort({ createdAt: -1 });

export const getMyApplication = async ({ user, id }) => {
  const application = await findOwnedApplication(user, id);
  return populateDetail(application);
};

// Moves an application to a new status, but only if it is still in an allowed status
const studentTransition = async ({ user, id, allowedFrom, toStatus, remarks, verb }) => {
  const application = await findOwnedApplication(user, id);

  if (!allowedFrom.includes(application.status)) {
    throw ApiError.conflict(`An application that is "${application.status}" cannot be ${verb}`);
  }

  const now = new Date();
  const set = { status: toStatus };
  if (toStatus === APPLICATION_STATUS.SUBMITTED && !application.submittedAt) set.submittedAt = now;

  const updated = await Application.findOneAndUpdate(
    { _id: application._id, status: { $in: allowedFrom } },
    {
      $set: set,
      $push: {
        statusHistory: { status: toStatus, changedBy: user._id, changedAt: now, ...(remarks ? { remarks } : {}) },
      },
    },
    { new: true }
  );
  if (!updated) {
    throw ApiError.conflict("The application was just changed. Please refresh and try again");
  }
  return populateDetail(updated);
};

export const submitMyApplication = async ({ user, id, req }) => {
  // Phase 11 adds: every required document must be uploaded before submitting
  const updated = await studentTransition({
    user,
    id,
    allowedFrom: STUDENT_CAN_SUBMIT_FROM,
    toStatus: APPLICATION_STATUS.SUBMITTED,
    verb: "submitted",
  });

  const company = updated.employerId?.companyName;
  await audit(req, user, AUDIT_ACTIONS.APPLICATION_SUBMITTED, updated, `Submitted to ${company}`);
  await notifyUser({
    userId: user._id,
    category: NOTIFICATION_CATEGORIES.APPLICATION,
    message: `Your application to ${company} was submitted. A coordinator will review it.`,
    link: "/student/tracking",
  });
  return updated;
};

export const withdrawMyApplication = async ({ user, id, remarks, req }) => {
  const updated = await studentTransition({
    user,
    id,
    allowedFrom: STUDENT_CAN_WITHDRAW_FROM,
    toStatus: APPLICATION_STATUS.WITHDRAWN,
    remarks,
    verb: "withdrawn",
  });

  await audit(req, user, AUDIT_ACTIONS.APPLICATION_WITHDRAWN, updated, "Application withdrawn by student");
  return updated;
};

// Record-level check for employers (BOLA), mirroring findOwnedApplication for students
const findEmployerApplication = async (employer, id) => {
  const application = await Application.findById(id);
  if (!application || !canViewApplication({ user: { role: "employer" }, application, employerId: employer._id })) {
    throw ApiError.notFound("Application not found");
  }
  return application;
};

export const listEmployerApplications = async (user) => {
  const employer = await requireEmployerRecord(user._id);
  return Application.find({ employerId: employer._id })
    .populate("studentId", "name studentProfile.course")
    .sort({ createdAt: -1 });
};

export const getEmployerApplication = async ({ user, id }) => {
  const employer = await requireEmployerRecord(user._id);
  const application = await findEmployerApplication(employer, id);
  return application.populate([
    { path: "employerId", select: "companyName" },
    { path: "studentId", select: "name studentProfile.course" },
  ]);
};

export const respondToApplication = async ({ user, id, status, remarks, req }) => {
  const employer = await requireEmployerRecord(user._id);
  const application = await findEmployerApplication(employer, id);

  if (application.status !== APPLICATION_STATUS.APPROVED) {
    throw ApiError.conflict('Only an "Approved" application can receive a response');
  }
  if (application.employerResponse?.status !== EMPLOYER_RESPONSE.PENDING) {
    throw ApiError.conflict("A response has already been recorded for this application");
  }

  const updated = await Application.findOneAndUpdate(
    { _id: application._id, "employerResponse.status": EMPLOYER_RESPONSE.PENDING },
    { $set: { employerResponse: { status, remarks, respondedAt: new Date() } } },
    { new: true }
  ).populate("studentId", "name");
  if (!updated) throw ApiError.conflict("The application was just changed. Please refresh and try again");

  await logAction({
    req,
    userId: user._id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.APPLICATION_EMPLOYER_RESPONSE,
    module: AUDIT_MODULES.APPLICATIONS,
    targetId: updated._id,
    details: `Employer responded: ${status}`,
  });
  await notifyUser({
    userId: updated.studentId._id,
    category: NOTIFICATION_CATEGORIES.APPLICATION,
    message: `${employer.companyName} has ${status.toLowerCase()} your application.`,
    link: "/student/tracking",
  });
  return updated;
};