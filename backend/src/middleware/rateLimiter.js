import rateLimit from "express-rate-limit";

const build = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Whole API: 300 requests per 15 minutes per IP
export const apiLimiter = build(300, "Too many requests. Please try again later.");

// Login/register: stricter. Defined now, applied in Phase 7.
export const authLimiter = build(10, "Too many attempts. Please try again in 15 minutes.");