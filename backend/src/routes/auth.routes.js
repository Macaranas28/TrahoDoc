import { Router } from "express";
import { register, login, logout, me, changePassword } from "../controllers/auth.controller.js";
import { registerRules, loginRules, changePasswordRules } from "../validators/auth.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authLimiter, authenticate, changePasswordRules, validate, changePassword);

export default router;