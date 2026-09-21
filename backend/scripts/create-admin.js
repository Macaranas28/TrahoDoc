import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import { AUTH, ROLES } from "../src/utils/constants.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

try {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in this terminal first");
  }
  const strong =
    ADMIN_PASSWORD.length >= 8 &&
    ADMIN_PASSWORD.length <= 64 &&
    /[a-z]/.test(ADMIN_PASSWORD) &&
    /[A-Z]/.test(ADMIN_PASSWORD) &&
    /\d/.test(ADMIN_PASSWORD);
  if (!strong) {
    throw new Error("Password must be 8-64 characters with an uppercase letter, a lowercase letter and a number");
  }

  await connectDB();

  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new Error("A user with that email already exists");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, AUTH.BCRYPT_ROUNDS);
  const admin = await User.create({
    name: ADMIN_NAME.trim(),
    email,
    passwordHash,
    role: ROLES.ADMIN,
  });
  console.log(`✅ Admin created: ${admin.email}`);
} catch (error) {
  console.error("❌", error.message);
} finally {
  await mongoose.disconnect();
}