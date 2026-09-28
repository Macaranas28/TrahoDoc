import { generateSecret, generate, verify, generateURI } from "otplib";
import QRCode from "qrcode";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { verifyMfaPendingToken, signToken } from "../utils/token.js";
import { AUTH, MFA, AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";
import { logAction } from "./audit.service.js";
import { notifyUser } from "./notification.service.js";

const generateBackupCodes = () =>
  Array.from({ length: MFA.BACKUP_CODE_COUNT }, () => crypto.randomBytes(5).toString("hex"));

// otplib v13's verify() is async and allows a small time-drift window via digits/step options.
// window: 1 = accept the code from one 30-second step before/after, same tolerance as before.
const verifyTotp = (token, secret) => verify({ secret, token, window: 1 });

// Step 1: generate a NEW secret and QR code, but don't save it yet — see the flow explanation above
export const startMfaSetup = async ({ user, req }) => {
  const secret = generateSecret();
  const otpauthUrl = generateURI({ secret, issuer: MFA.ISSUER, label: user.email });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  await User.updateOne({ _id: user._id }, { $set: { mfaSecret: secret } });

  await logAction({
    req, userId: user._id, actorEmail: user.email,
    action: AUDIT_ACTIONS.MFA_SETUP_STARTED, module: AUDIT_MODULES.AUTH, targetId: user._id,
  });
  return { secret, qrCodeDataUrl };
};

// Step 2: user proves the app is working by sending back a real code
export const confirmMfaSetup = async ({ user, code, req }) => {
  const fresh = await User.findById(user._id).select("+mfaSecret");
  if (!fresh.mfaSecret) throw ApiError.badRequest("No MFA setup in progress. Start setup first.");

  const isValid = await verifyTotp(code, fresh.mfaSecret);
  if (!isValid) throw ApiError.badRequest("Invalid code. Please check your authenticator app and try again.");

  const backupCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(backupCodes.map((c) => bcrypt.hash(c, AUTH.BCRYPT_ROUNDS)));

  await User.updateOne({ _id: user._id }, { $set: { mfaEnabled: true, mfaBackupCodes: hashedCodes } });

  await logAction({
    req, userId: user._id, actorEmail: user.email,
    action: AUDIT_ACTIONS.MFA_ENABLED_ACTION, module: AUDIT_MODULES.AUTH, targetId: user._id,
  });
  await notifyUser({
    userId: user._id, category: "system",
    message: "Two-factor authentication was enabled on your account.",
  });

  return backupCodes;
};

export const disableMfa = async ({ user, currentPassword, req }) => {
  const fresh = await User.findById(user._id).select("+passwordHash");
  const ok = await bcrypt.compare(currentPassword, fresh.passwordHash);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");

  await User.updateOne(
    { _id: user._id },
    { $set: { mfaEnabled: false, mfaSecret: undefined, mfaBackupCodes: [] } }
  );

  await logAction({
    req, userId: user._id, actorEmail: user.email,
    action: AUDIT_ACTIONS.MFA_DISABLED, module: AUDIT_MODULES.AUTH, targetId: user._id,
  });
  await notifyUser({
    userId: user._id, category: "system",
    message: "Two-factor authentication was disabled on your account. If this wasn't you, secure your account immediately.",
  });
};

// Called during login, once the user submits their 6-digit code (or a backup code)
export const completeMfaLogin = async ({ mfaToken, code, req }) => {
  let payload;
  try {
    payload = verifyMfaPendingToken(mfaToken);
  } catch {
    throw ApiError.unauthorized("MFA session expired. Please log in again.");
  }

  const user = await User.findOne({ _id: payload.sub, tokenVersion: payload.tv }).select("+mfaSecret +mfaBackupCodes");
  if (!user || !user.mfaEnabled) throw ApiError.unauthorized();

  const isTotpValid = await verifyTotp(code, user.mfaSecret);

  if (isTotpValid) {
    await logAction({
      req, userId: user._id, actorEmail: user.email,
      action: AUDIT_ACTIONS.MFA_LOGIN_SUCCESS, module: AUDIT_MODULES.AUTH, targetId: user._id,
    });
    return { user, token: signToken(user) };
  }

  for (let i = 0; i < user.mfaBackupCodes.length; i++) {
    if (await bcrypt.compare(code, user.mfaBackupCodes[i])) {
      user.mfaBackupCodes.splice(i, 1);
      await user.save();

      await logAction({
        req, userId: user._id, actorEmail: user.email,
        action: AUDIT_ACTIONS.BACKUP_CODE_USED, module: AUDIT_MODULES.AUTH, targetId: user._id,
        details: `${user.mfaBackupCodes.length} backup codes remaining`,
      });
      await notifyUser({
        userId: user._id, category: "system",
        message: `A backup code was used to log in. ${user.mfaBackupCodes.length} backup codes remain.`,
      });
      return { user, token: signToken(user) };
    }
  }

  await logAction({
    req, userId: user._id, actorEmail: user.email,
    action: AUDIT_ACTIONS.MFA_LOGIN_FAILED, module: AUDIT_MODULES.AUTH, targetId: user._id, result: "failure",
  });
  throw ApiError.unauthorized("Invalid authentication code");
};