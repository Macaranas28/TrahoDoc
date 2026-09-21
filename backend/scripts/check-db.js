import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import "../src/models/User.js";
import "../src/models/Employer.js";
import Requirement from "../src/models/Requirement.js";
import "../src/models/Document.js";
import "../src/models/Application.js";
import "../src/models/Notification.js";
import "../src/models/AuditLog.js";

try {
  await connectDB();

  // Build the indexes defined in Phase 4
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  console.log("✅ Indexes ready for:", Object.keys(mongoose.models).join(", "));

  const first = await Requirement.create({ name: "Connection Test", appliesTo: "student" });
  console.log("✅ Write OK");

  const found = await Requirement.findById(first._id);
  console.log("✅ Read OK:", found.name);

  try {
    await Requirement.create({ name: "Connection Test", appliesTo: "student" });
    console.log("❌ Duplicate was allowed (unique index not working)");
  } catch (err) {
    console.log(err.code === 11000 ? "✅ Unique index works (duplicate rejected)" : `❌ Unexpected error: ${err.message}`);
  }

  await Requirement.deleteOne({ _id: first._id });
  console.log("✅ Delete OK (test data cleaned up)");
} catch (err) {
  console.error("❌ Test failed:", err.message);
} finally {
  await mongoose.disconnect();
}