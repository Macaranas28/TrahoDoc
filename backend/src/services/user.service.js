import bcrypt from "bcrypt";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { AUTH, AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";
import { logAction } from "./audit.service.js";

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