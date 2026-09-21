import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Requirement from "../src/models/Requirement.js";
import { REQUIREMENT_TARGET } from "../src/utils/constants.js";

const { STUDENT, EMPLOYER } = REQUIREMENT_TARGET;

const defaults = [
  { name: "Resume", appliesTo: STUDENT, description: "Your updated resume or CV" },
  { name: "Endorsement Letter", appliesTo: STUDENT, description: "Letter from the school endorsing you for OJT" },
  { name: "Parent/Guardian Consent Form", appliesTo: STUDENT, description: "Signed consent form" },
  { name: "Copy of School ID", appliesTo: STUDENT, description: "Clear copy of your school ID" },
  { name: "Certificate of Registration", appliesTo: STUDENT, description: "Current semester registration" },
  { name: "Business Permit", appliesTo: EMPLOYER, description: "Current business or mayor's permit" },
  { name: "SEC/DTI Registration", appliesTo: EMPLOYER, description: "Company registration document" },
  { name: "Company Profile", appliesTo: EMPLOYER, description: "Short profile of the company" },
  { name: "Signed Memorandum of Agreement", appliesTo: EMPLOYER, description: "MOA with the school" },
];

try {
  await connectDB();

  for (const item of defaults) {
    const result = await Requirement.updateOne(
      { name: item.name, appliesTo: item.appliesTo },
      { $setOnInsert: { description: item.description, isRequired: true, isActive: true } },
      { upsert: true }
    );
    console.log(
      result.upsertedCount
        ? `✅ Added: ${item.name} (${item.appliesTo})`
        : `– Already exists: ${item.name} (${item.appliesTo})`
    );
  }
} catch (error) {
  console.error("❌", error.message);
} finally {
  await mongoose.disconnect();
}