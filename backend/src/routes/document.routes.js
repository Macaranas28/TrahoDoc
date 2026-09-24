import { Router } from "express";
import { getMyDocuments, upload, replace, verifyIntegrity, openForReview, review } from "../controllers/document.controller.js";
import { uploadDocumentRules, requireValidFile } from "../validators/document.validators.js";
import { reviewDocumentRules } from "../validators/coordinator.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { uploadSingle, handleUploadErrors } from "../middleware/upload.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const studentOrEmployer = requireRole(ROLES.STUDENT, ROLES.EMPLOYER);
const coordinatorOnly = requireRole(ROLES.COORDINATOR);

router.use(authenticate); // every route below needs a login AND its own role guard

router.get("/mine", requireRole(ROLES.STUDENT, ROLES.EMPLOYER), getMyDocuments);

router.post("/", studentOrEmployer, uploadSingle, handleUploadErrors, uploadDocumentRules, validate, requireValidFile, upload);
router.put("/:id", studentOrEmployer, idParam, validate, uploadSingle, handleUploadErrors, requireValidFile, replace);

router.post("/:id/verify-integrity", coordinatorOnly, idParam, validate, verifyIntegrity);
router.get("/:id/review", coordinatorOnly, idParam, validate, openForReview);
router.patch("/:id/review", coordinatorOnly, idParam, reviewDocumentRules, validate, review);

export default router;