import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";
import { logAction } from "./audit.service.js";

// Phase 9B uses this: a student must complete the profile before applying
export const isProfileComplete = (user) =>
  Boolean(user.studentProfile?.phone && user.studentProfile?.course && user.studentProfile?.yearLevel);

export const updateStudentProfile = async ({ userId, name, phone, course, yearLevel, req }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name,
        "studentProfile.phone": phone,
        "studentProfile.course": course,
        "studentProfile.yearLevel": yearLevel,
      },
    },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound("User not found");

  await logAction({
    req,
    userId,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.PROFILE_UPDATED,
    module: AUDIT_MODULES.STUDENTS,
    targetId: userId,
    details: "Profile updated",
  });
  return user;
};