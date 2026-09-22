import { body } from "express-validator";
import { EMPLOYER_RESPONSE } from "../utils/constants.js";

export const updateEmployerProfileRules = [
  body("companyName")
    .isString().withMessage("Company name must be text").bail()
    .trim().isLength({ min: 2, max: 150 }).withMessage("Company name must be 2 to 150 characters"),
  body("contactPerson")
    .isString().withMessage("Contact person must be text").bail()
    .trim().isLength({ min: 2, max: 100 }).withMessage("Contact person must be 2 to 100 characters"),
  body("phone")
    .isString().withMessage("Phone must be text").bail()
    .trim().matches(/^[0-9+()\-\s]{7,20}$/).withMessage("Enter a valid phone number"),
  body("address").optional().isString().trim().isLength({ max: 250 }),
  body("industry").optional().isString().trim().isLength({ max: 100 }),
  body("website").optional({ values: "falsy" }).isString().trim().isLength({ max: 200 }).isURL().withMessage("Enter a valid URL"),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
];

export const employerResponseRules = [
  body("status")
    .isString().withMessage("Status must be text").bail()
    .isIn([EMPLOYER_RESPONSE.ACCEPTED, EMPLOYER_RESPONSE.DECLINED]).withMessage("Status must be Accepted or Declined"),
  body("remarks").optional().isString().trim().isLength({ max: 500 }),
];