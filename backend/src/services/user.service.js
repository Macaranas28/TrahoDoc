import bcrypt from "bcrypt";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { AUTH, AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import Application from "../models/Application.js";

export const createUserByAdmin = async ({ name, email, password, role, admin, req }) => {
  if (await User.exists({ email })) {
    throw ApiError.conflict("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role });

  await logAction({
    req,
    userId: admin._id,
    actorEmail: admin.email,
    action: AUDIT_ACTIONS.USER_CREATED,
    module: AUDIT_MODULES.USERS,
    targetId: user._id,
    details: `Created ${role} account`,
  });
  return user;
};

export const listUsers = async ({ role, page, limit }) => {
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total };
};

export const assignCoordinator = async ({ applicationId, coordinatorId, admin, req }) => {
  const coordinator = await User.findOne({ _id: coordinatorId, role: "coordinator" });
  if (!coordinator) throw ApiError.badRequest("That user is not a coordinator");

  const application = await Application.findByIdAndUpdate(
    applicationId,
    { $set: { assignedCoordinatorId: coordinatorId } },
    { new: true }
  );
  if (!application) throw ApiError.notFound("Application not found");

  await logAction({
    req, userId: admin._id, actorEmail: admin.email,
    action: AUDIT_ACTIONS.APPLICATION_ASSIGNED, module: AUDIT_MODULES.APPLICATIONS,
    targetId: application._id, details: `Assigned to coordinator ${coordinator.email}`,
  });
  return application;
};

export const changeUserStatus = async ({ targetUserId, status, admin, req }) => {
  if (targetUserId === admin._id.toString()) {
    throw ApiError.badRequest("You cannot change your own account status");
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { $set: { status }, $inc: { tokenVersion: 1 } }, // sign them out everywhere if disabling
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found");

  await logAction({
    req, userId: admin._id, actorEmail: admin.email,
    action: AUDIT_ACTIONS.USER_STATUS_CHANGED, module: AUDIT_MODULES.USERS,
    targetId: user._id, details: `Status changed to ${status}`,
  });
  return user;
};