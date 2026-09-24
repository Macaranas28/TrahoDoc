import { RISK_FLAG_CODES, RISK_SEVERITY, RISK_FLAG_STATUS } from "../utils/constants.js";

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

// Runs read-only checks and returns any NEW flags to add — never touches flags that already exist,
// so a coordinator's past dismiss/confirm decisions are never overwritten by a re-scan.
export const detectRiskFlags = async (employer, { duplicatePhoneExists }) => {
  const existingCodes = new Set(employer.riskFlags.map((f) => f.code));
  const newFlags = [];

  const add = (code, message, severity) => {
    if (!existingCodes.has(code)) {
      newFlags.push({ code, message, severity, status: RISK_FLAG_STATUS.OPEN });
    }
  };

  if (!employer.businessInformation?.address || !employer.businessInformation?.industry) {
    add(RISK_FLAG_CODES.INCOMPLETE_INFO, "Business address or industry is missing from the company profile.", RISK_SEVERITY.LOW);
  }

  const domain = employer.email?.split("@")[1]?.toLowerCase();
  if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
    add(RISK_FLAG_CODES.FREE_EMAIL_DOMAIN, `Company contact email uses a free provider (${domain}) rather than a company domain.`, RISK_SEVERITY.LOW);
  }

  if (duplicatePhoneExists) {
    add(RISK_FLAG_CODES.DUPLICATE_PHONE, "This phone number is also used by another registered employer.", RISK_SEVERITY.MEDIUM);
  }

  return newFlags;
};