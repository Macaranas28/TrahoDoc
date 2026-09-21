import Requirement from "../models/Requirement.js";
import { ROLES, REQUIREMENT_TARGET } from "../utils/constants.js";

export const listRequirementsFor = (user) => {
  const filter = { isActive: true };
  if (user.role === ROLES.STUDENT) filter.appliesTo = REQUIREMENT_TARGET.STUDENT;
  if (user.role === ROLES.EMPLOYER) filter.appliesTo = REQUIREMENT_TARGET.EMPLOYER;
  // coordinators and admins see every active requirement
  return Requirement.find(filter).sort({ name: 1 });
};