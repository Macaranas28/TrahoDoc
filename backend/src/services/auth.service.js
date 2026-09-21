import bcrypt from "bcrypt";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { AUTH, AUDIT_ACTIONS, AUDIT_MODULES, USER_STATUS } from "../utils/constants.js";
import { signToken, verifyToken } from "../utils/token.js";
import { logAction } from "./audit.service.js";

const INVALID_LOGIN = "Invalid email or password";

// Used to make "unknown email" take as long as "wrong password"
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", AUTH.BCRYPT_ROUNDS);

const authLog = (req, user, email, action, result, details) =>
  logAction({
    req,
    userId: user?._id ?? null,
    actorEmail: email,
    targetId: user?._id ?? null,
    action,
    module: AUDIT_MODULES.AUTH,
    result,
    details,
  });

const lockedError = (lockUntil) => {
  const minutes = Math.max(1, Math.ceil((lockUntil.getTime() - Date.now()) / 60000));
  return new ApiError(423, `Account temporarily locked. Try again in ${minutes} minute(s).`);
};

// Only send the browser fields it is allowed to see
export const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  mfaEnabled: user.mfaEnabled,
  studentProfile: user.studentProfile,
});

export const registerUser = async ({ name, email, password, role, req }) => {
  if (await User.exists({ email })) {
    throw ApiError.conflict("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role });

  await authLog(req, user, email, AUDIT_ACTIONS.REGISTER, "success");
  return user;
};

export const loginUser = async ({ email, password, req }) => {
  const user = await User.findOne({ email }).select("+passwordHash");

  // 1. Unknown email
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    await authLog(req, null, email, AUDIT_ACTIONS.LOGIN_FAILED, "failure", "Unknown email");
    throw ApiError.unauthorized(INVALID_LOGIN);
  }

  // 2. Account currently locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    await authLog(req, user, email, AUDIT_ACTIONS.LOGIN_FAILED, "failure", "Attempt while account locked");
    throw lockedError(user.lockUntil);
  }

  // 3. Check the password
  const passwordOk = await bcrypt.compare(password, user.passwordHash);

  if (!passwordOk) {
    // $inc is atomic, so many parallel guesses cannot skip the counter
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $inc: { failedLoginAttempts: 1 } },
      { new: true }
    );
    await authLog(req, user, email, AUDIT_ACTIONS.LOGIN_FAILED, "failure", "Wrong password");

    if (updated.failedLoginAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + AUTH.LOCK_DURATION_MS);
      await User.updateOne({ _id: user._id }, { $set: { lockUntil, failedLoginAttempts: 0 } });
      await authLog(req, user, email, AUDIT_ACTIONS.ACCOUNT_LOCKED, "failure", "Too many failed attempts");
      throw lockedError(lockUntil);
    }
    throw ApiError.unauthorized(INVALID_LOGIN);
  }

  // 4. Correct password, but the account may be disabled
  if (user.status !== USER_STATUS.ACTIVE) {
    await authLog(req, user, email, AUDIT_ACTIONS.LOGIN_FAILED, "failure", "Disabled account");
    throw ApiError.forbidden("This account is disabled. Please contact the administrator.");
  }

  // 5. Success: reset the counters
  await User.updateOne(
    { _id: user._id },
    { $set: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() } }
  );
  await authLog(req, user, email, AUDIT_ACTIONS.LOGIN_SUCCESS, "success");

  // MFA check will be added here in Phase 16

  return { user, token: signToken(user) };
};

export const logoutUser = async ({ token, req }) => {
  if (!token) return;

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return; // expired or invalid: nothing to revoke
  }

  // Bumping tokenVersion makes every token issued before now useless
  const user = await User.findOneAndUpdate(
    { _id: payload.sub, tokenVersion: payload.tv },
    { $inc: { tokenVersion: 1 } }
  );
  if (user) {
    await authLog(req, user, user.email, AUDIT_ACTIONS.LOGOUT, "success");
  }
};