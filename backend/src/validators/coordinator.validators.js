import { body } from "express-validator";
import { DOCUMENT_STATUS, APPLICATION_STATUS } from "../utils/constants.js";
import { ACCREDITATION_STATUS, RISK_FLAG_STATUS } from "../utils/constants.js"; // merge into existing import

export const reviewDocumentRules = [
  body("status")
    .isString().withMessage("Status must be text").bail()
    .isIn([DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED]).withMessage("Status must be Verified or Rejected"),
  body("remarks")
    .if(body("status").equals(DOCUMENT_STATUS.REJECTED))
    .notEmpty().withMessage("Remarks are required when rejecting a document")
    .bail()
    .isString().trim().isLength({ max: 500 }),
  body("remarks").optional().isString().trim().isLength({ max: 500 }),
];

export const changeApplicationStatusRules = [
  body("status")
    .isString().withMessage("Status must be text").bail()
    .isIn([APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.NEEDS_REVISION, APPLICATION_STATUS.REJECTED])
    .withMessage("Status must be Approved, Needs Revision, or Rejected"),
  body("remarks")
    .if(body("status").not().equals(APPLICATION_STATUS.APPROVED))
    .notEmpty().withMessage("Remarks are required for this status")
    .bail()
    .isString().trim().isLength({ max: 500 }),
  body("remarks").optional().isString().trim().isLength({ max: 500 }),
];

export const assignCoordinatorRules = [
  body("coordinatorId")
    .isString().withMessage("coordinatorId must be text").bail()
    .isMongoId().withMessage("Invalid coordinator ID"),
];

export const accreditationDecisionRules = [
  body("status")
    .isString().withMessage("Status must be text").bail()
    .isIn([ACCREDITATION_STATUS.ACCREDITED, ACCREDITATION_STATUS.REJECTED]).withMessage("Status must be Accredited or Rejected"),
  body("remarks")
    .if(body("status").equals(ACCREDITATION_STATUS.REJECTED))
    .notEmpty().withMessage("Remarks are required when rejecting")
    .bail().isString().trim().isLength({ max: 500 }),
  body("remarks").optional().isString().trim().isLength({ max: 500 }),
];

export const riskFlagReviewRules = [
  body("status")
    .isString().withMessage("Status must be text").bail()
    .isIn([RISK_FLAG_STATUS.DISMISSED, RISK_FLAG_STATUS.CONFIRMED]).withMessage("Status must be Dismissed or Confirmed"),
  body("reviewNote")
    .isString().withMessage("A reason is required").bail()
    .trim().isLength({ min: 3, max: 500 }).withMessage("Reason must be 3 to 500 characters"),
];