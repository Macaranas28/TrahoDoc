export const ROLES = Object.freeze({
  STUDENT: "student",
  COORDINATOR: "coordinator",
  EMPLOYER: "employer",
  ADMIN: "admin",
});

export const USER_STATUS = Object.freeze({ ACTIVE: "active", DISABLED: "disabled" });

export const APPLICATION_STATUS = Object.freeze({
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  NEEDS_REVISION: "Needs Revision",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
});

export const DOCUMENT_STATUS = Object.freeze({
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  POSSIBLE_MODIFICATION: "Possible Modification",
});

export const ACCREDITATION_STATUS = Object.freeze({
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  ACCREDITED: "Accredited",
  REJECTED: "Rejected",
});

export const EMPLOYER_RESPONSE = Object.freeze({
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
});

export const REQUIREMENT_TARGET = Object.freeze({ STUDENT: "student", EMPLOYER: "employer" });

// Risk flags are INDICATORS for a coordinator to review, not proof of fraud.
export const RISK_FLAG_CODES = Object.freeze({
  MISSING_PERMIT: "MISSING_PERMIT",
  FREE_EMAIL_DOMAIN: "FREE_EMAIL_DOMAIN",
  INCOMPLETE_INFO: "INCOMPLETE_INFO",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  EXPIRED_DOCUMENT: "EXPIRED_DOCUMENT",
});
export const RISK_SEVERITY = Object.freeze({ LOW: "low", MEDIUM: "medium", HIGH: "high" });
export const RISK_FLAG_STATUS = Object.freeze({
  OPEN: "open",
  DISMISSED: "dismissed",
  CONFIRMED: "confirmed",
});

export const NOTIFICATION_CATEGORIES = Object.freeze({
  APPLICATION: "application",
  DOCUMENT: "document",
  ACCREDITATION: "accreditation",
  SYSTEM: "system",
});

export const AUDIT_ACTIONS = Object.freeze({
  REGISTER: "REGISTER",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  MFA_ENABLED: "MFA_ENABLED",
  PROFILE_UPDATED: "PROFILE_UPDATED",
  APPLICATION_CREATED: "APPLICATION_CREATED",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_INTEGRITY_CHECKED: "DOCUMENT_INTEGRITY_CHECKED",
  DOCUMENT_VERIFIED: "DOCUMENT_VERIFIED",
  DOCUMENT_REJECTED: "DOCUMENT_REJECTED",
  EMPLOYER_ACCREDITED: "EMPLOYER_ACCREDITED",
  EMPLOYER_REJECTED: "EMPLOYER_REJECTED",
  USER_CREATED: "USER_CREATED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
  ACCESS_DENIED: "ACCESS_DENIED",
});

export const AUDIT_MODULES = Object.freeze({
  AUTH: "auth",
  USERS: "users",
  STUDENTS: "students",
  EMPLOYERS: "employers",
  APPLICATIONS: "applications",
  DOCUMENTS: "documents",
  SECURITY: "security",
});

export const UPLOAD_RULES = Object.freeze({
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: ["application/pdf", "image/jpeg", "image/png"],
});

export const AUTH = Object.freeze({
  BCRYPT_ROUNDS: 12,
  MAX_FAILED_ATTEMPTS: 3,
  LOCK_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  IDLE_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes
  IDLE_TIMEOUT_SECONDS: 15 * 60,
});