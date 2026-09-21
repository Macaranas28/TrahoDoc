import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { USER_STATUS } from "../utils/constants.js";
import {
  COOKIE_NAME,
  verifyToken,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from "../utils/token.js";

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw ApiError.unauthorized();

  const expired = () => {
    clearAuthCookie(res);
    return ApiError.unauthorized("Session expired. Please log in again.");
  };

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw expired();
  }

  // Check the database every time: the user may have been disabled or logged out
  const user = await User.findById(payload.sub);
  if (!user || user.status !== USER_STATUS.ACTIVE || user.tokenVersion !== payload.tv) {
    throw expired();
  }

  req.user = user;

  // Sliding idle timeout: every request earns a fresh 15 minutes
  setAuthCookie(res, signToken(user));
  next();
};