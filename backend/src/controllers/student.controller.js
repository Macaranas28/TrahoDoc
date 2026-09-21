import { updateStudentProfile, isProfileComplete } from "../services/student.service.js";
import { toPublicUser } from "../services/auth.service.js";

const profileView = (user) => ({ ...toPublicUser(user), profileComplete: isProfileComplete(user) });

export const getMyProfile = (req, res) => {
  res.json({ success: true, data: { profile: profileView(req.user) } });
};

export const updateMyProfile = async (req, res) => {
  const { name, phone, course, yearLevel } = req.body; // only these four fields are ever used
  const user = await updateStudentProfile({ userId: req.user._id, name, phone, course, yearLevel, req });

  res.json({ success: true, message: "Profile updated", data: { profile: profileView(user) } });
};