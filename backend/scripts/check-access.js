import { canViewApplication, canViewDocument } from "../src/utils/access.js";
import { ROLES } from "../src/utils/constants.js";

const check = (label, actual, expected) =>
  console.log(actual === expected ? `✅ ${label}` : `❌ ${label} (got ${actual}, expected ${expected})`);

const student = { _id: "s1", role: ROLES.STUDENT };
const otherStudent = { _id: "s2", role: ROLES.STUDENT };
const coord = { _id: "c1", role: ROLES.COORDINATOR };
const otherCoord = { _id: "c2", role: ROLES.COORDINATOR };
const employer = { _id: "u_e1", role: ROLES.EMPLOYER };
const admin = { _id: "a1", role: ROLES.ADMIN };

const application = { studentId: "s1", employerId: "e1", assignedCoordinatorId: "c1" };
const unassigned = { ...application, assignedCoordinatorId: null };

check("Student sees own application", canViewApplication({ user: student, application }), true);
check("Student cannot see another student's application", canViewApplication({ user: otherStudent, application }), false);
check("Assigned coordinator sees application", canViewApplication({ user: coord, application }), true);
check("Unassigned coordinator cannot see application", canViewApplication({ user: otherCoord, application }), false);
check("Nobody-assigned application is hidden from coordinators", canViewApplication({ user: coord, application: unassigned }), false);
check("Employer of that company sees application", canViewApplication({ user: employer, application, employerId: "e1" }), true);
check("Employer of another company cannot", canViewApplication({ user: employer, application, employerId: "e2" }), false);
check("Admin cannot read applications", canViewApplication({ user: admin, application }), false);

const studentDoc = { ownerId: "s1", applicationId: "a1" };
const employerDoc = { ownerId: "u_e1", employerId: "e1" };

check("Student sees own document", canViewDocument({ user: student, document: studentDoc, application }), true);
check("Other student cannot see it", canViewDocument({ user: otherStudent, document: studentDoc, application }), false);
check("Assigned coordinator sees student document", canViewDocument({ user: coord, document: studentDoc, application }), true);
check("Unassigned coordinator cannot see student document", canViewDocument({ user: otherCoord, document: studentDoc, application }), false);
check("Employer cannot see student document", canViewDocument({ user: employer, document: studentDoc, application }), false);
check("Employer sees own accreditation document", canViewDocument({ user: employer, document: employerDoc }), true);
check("Any coordinator sees accreditation document", canViewDocument({ user: otherCoord, document: employerDoc }), true);
check("Student cannot see employer document", canViewDocument({ user: student, document: employerDoc }), false);
check("Admin cannot see documents", canViewDocument({ user: admin, document: studentDoc, application }), false);