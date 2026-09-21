import rateLimit from "express-rate-limit";

const build = (limit, message, extra = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    ...extra,
  });

// Whole API: 300 requests per 15 minutes per IP
export const apiLimiter = build(300, "Too many requests. Please try again later.");

// Login/register: 10 FAILED requests per 15 minutes per IP
export const authLimiter = build(10, "Too many attempts. Please try again in 15 minutes.", {
  skipSuccessfulRequests: true,
});