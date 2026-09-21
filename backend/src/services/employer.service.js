import Employer from "../models/Employer.js";
import { ACCREDITATION_STATUS } from "../utils/constants.js";

// Only the fields a student needs. No email, phone, contact person, or risk flags.
export const listAccreditedEmployers = () =>
  Employer.find({ accreditationStatus: ACCREDITATION_STATUS.ACCREDITED })
    .select("companyName businessInformation")
    .sort({ companyName: 1 })
    .limit(100);