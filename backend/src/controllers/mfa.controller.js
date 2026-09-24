import { startMfaSetup, confirmMfaSetup, disableMfa, completeMfaLogin } from "../services/mfa.service.js";
import { toPublicUser } from "../services/auth.service.js";
import { setAuthCookie } from "../utils/token.js";

export const setup = async (req, res) => {
  const { qrCodeDataUrl } = await startMfaSetup({ user: req.user, req });
  res.json({ success: true, data: { qrCodeDataUrl } }); // the raw secret is deliberately NOT sent to the client
};

export const confirm = async (req, res) => {
  const backupCodes = await confirmMfaSetup({ user: req.user, code: req.body.code, req });
  res.json({
    success: true,
    message: "MFA enabled",
    data: { backupCodes }, // shown once — the frontend must tell the user to save these now
  });
};

export const disable = async (req, res) => {
  await disableMfa({ user: req.user, currentPassword: req.body.currentPassword, req });
  res.json({ success: true, message: "MFA disabled" });
};

export const verifyLogin = async (req, res) => {
  const { user, token } = await completeMfaLogin({ mfaToken: req.body.mfaToken, code: req.body.code, req });
  setAuthCookie(res, token);
  res.json({ success: true, message: "Login successful", data: { user: toPublicUser(user) } });
};