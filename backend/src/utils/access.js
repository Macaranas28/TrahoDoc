import { ROLES } from "./constants.js";

export const isSameId = (a, b) => Boolean(a) && Boolean(b) && a.toString() === b.toString();

// employerId = the Employer record that belongs to this user (only needed for employers)
export const canViewApplication = ({ user, application, employerId }) => {
  switch (user.role) {
    case ROLES.STUDENT:
      return isSameId(application.studentId, user._id);
    case ROLES.COORDINATOR:
      return isSameId(application.assignedCoordinatorId, user._id); // assigned only
    case ROLES.EMPLOYER:
      return isSameId(application.employerId, employerId);
    default:
      return false; // admins do not read application data
  }
};

// application = the application the document belongs to (needed for student documents)
export const canViewDocument = ({ user, document, application }) => {
  switch (user.role) {
    case ROLES.STUDENT:
    case ROLES.EMPLOYER:
      return isSameId(document.ownerId, user._id); // employers never see student documents
    case ROLES.COORDINATOR:
      if (document.employerId) return true; // accreditation documents: any coordinator vets employers
      return Boolean(application) && isSameId(application.assignedCoordinatorId, user._id);
    default:
      return false;
  }
};