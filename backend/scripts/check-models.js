import mongoose from "mongoose";
import User from "../src/models/User.js";
import Employer from "../src/models/Employer.js";
import Requirement from "../src/models/Requirement.js";
import Document from "../src/models/Document.js";
import Application from "../src/models/Application.js";
import Notification from "../src/models/Notification.js";
import AuditLog from "../src/models/AuditLog.js";

const id = () => new mongoose.Types.ObjectId();
const hash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

const show = (label, doc) => {
  const err = doc.validateSync();
  console.log(err ? `❌ ${label} -> ${Object.keys(err.errors).join(", ")}` : `✅ ${label} -> valid`);
};

const goodDoc = {
  ownerId: id(), applicationId: id(), documentType: "Resume",
  originalFileName: "resume.pdf", fileUrl: "https://example.com/resume.pdf",
  cloudinaryPublicId: "trahodoc/resume1", mimeType: "application/pdf",
  sizeBytes: 1000, fileHash: hash,
};

show("User (good)", new User({ name: "Ana Reyes", email: "ana@example.com", passwordHash: "test-only-placeholder" }));
show("User (bad)", new User({ name: "A", email: "not-an-email", role: "superadmin" }));
show("Employer (good)", new Employer({ ownerUserId: id(), companyName: "Example Tech Corp", contactPerson: "Ben Cruz", email: "hr@exampletech.com", phone: "0288881234" }));
show("Requirement (good)", new Requirement({ name: "Resume", appliesTo: "student" }));
show("Requirement (bad)", new Requirement({ name: "Resume", appliesTo: "visitor" }));
show("Document (good)", new Document(goodDoc));
show("Document (both application and employer)", new Document({ ...goodDoc, employerId: id() }));
show("Document (bad hash and file type)", new Document({ ...goodDoc, fileHash: "abc", mimeType: "application/x-msdownload" }));
show("Application (good)", new Application({ studentId: id(), employerId: id() }));
show("Application (bad status)", new Application({ studentId: id(), employerId: id(), status: "Done" }));
show("Notification (good)", new Notification({ userId: id(), category: "document", message: "Your document was verified" }));
show("AuditLog (good)", new AuditLog({ action: "LOGIN_SUCCESS", module: "auth", result: "success" }));
show("AuditLog (bad action)", new AuditLog({ action: "HACKED", module: "auth", result: "success" }));