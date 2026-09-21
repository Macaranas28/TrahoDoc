import { registerUser, loginUser, logoutUser, toPublicUser } from "../services/auth.service.js";
import { COOKIE_NAME, setAuthCookie, clearAuthCookie } from "../utils/token.js";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body; // pick fields explicitly
  const user = await registerUser({ name, email, password, role, req });

  res.status(201).json({
    success: true,
    message: "Registration successful. You can now log in.",
    data: { user: toPublicUser(user) },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password, req });

  setAuthCookie(res, token);
  res.json({ success: true, message: "Login successful", data: { user: toPublicUser(user) } });
};

export const logout = async (req, res) => {
  await logoutUser({ token: req.cookies?.[COOKIE_NAME], req });
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out" });
};

export const me = (req, res) => {
  res.json({ success: true, data: { user: toPublicUser(req.user) } });
};