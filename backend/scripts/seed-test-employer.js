import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Employer from "../src/models/Employer.js";
import { ACCREDITATION_STATUS, ROLES } from "../src/utils/constants.js";

try {
  await connectDB();

  const owner = await User.findOne({ email: "employer1@example.com", role: ROLES.EMPLOYER });
  if (!owner) {
    throw new Error("Register employer1@example.com with role employer first");
  }

  if (await Employer.exists({ ownerUserId: owner._id })) {
    console.log("– Test employer already exists");
  } else {
    await Employer.create({
      ownerUserId: owner._id,
      companyName: "Example Tech Corp",
      contactPerson: "Test Employer",
      email: owner.email,
      phone: "0288881234",
      businessInformation: {
        address: "Sample City",
        industry: "Software",
        description: "TEST DATA - safe to delete",
      },
      accreditationStatus: ACCREDITATION_STATUS.ACCREDITED,
      accreditedAt: new Date(),
    });
    console.log("✅ Test employer created (Example Tech Corp, Accredited)");
  }
} catch (error) {
  console.error("❌", error.message);
} finally {
  await mongoose.disconnect();
}