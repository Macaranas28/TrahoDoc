import { Router } from "express";
import { register, login, logout, me, changePassword } from "../controllers/auth.controller.js";
import { setup, confirm, disable, verifyLogin } from "../controllers/mfa.controller.js";
import { registerRules, loginRules, changePasswordRules } from "../validators/auth.validators.js";
import { mfaCodeRules, mfaLoginRules, disableMfaRules } from "../validators/mfa.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authLimiter, authenticate, changePasswordRules, validate, changePassword);

router.post("/mfa/setup", authenticate, setup);
router.post("/mfa/confirm", authenticate, mfaCodeRules, validate, confirm);
router.post("/mfa/disable", authenticate, disableMfaRules, validate, disable);
router.post("/mfa/verify-login", authLimiter, mfaLoginRules, validate, verifyLogin); // no `authenticate` — the mfaToken IS the credential here

export default router;