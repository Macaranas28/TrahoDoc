import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "./constants.js";

export const COOKIE_NAME = "trahodoc_token";

export const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, tv: user.tokenVersion },
    env.jwtSecret,
    { algorithm: "HS256", expiresIn: AUTH.IDLE_TIMEOUT_SECONDS }
  );

export const verifyToken = (token) =>
  jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });

const baseCookieOptions = () => ({
  httpOnly: true, // JavaScript in the browser cannot read it
  secure: env.isProduction, // HTTPS only in production
  sameSite: "lax", // not sent on cross-site POSTs
  path: "/",
});

export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...baseCookieOptions(), maxAge: AUTH.IDLE_TIMEOUT_MS });

export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, baseCookieOptions());

// A separate, narrow-purpose token: it can ONLY be used to complete MFA login, nothing else.
export const signMfaPendingToken = (user) =>
  jwt.sign({ sub: user._id.toString(), tv: user.tokenVersion, purpose: "mfa_pending" }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: MFA.PENDING_TOKEN_TTL_SECONDS,
  });

export const verifyMfaPendingToken = (token) => {
  const payload = verifyToken(token);
  if (payload.purpose !== "mfa_pending") throw new Error("Invalid token purpose");
  return payload;
};