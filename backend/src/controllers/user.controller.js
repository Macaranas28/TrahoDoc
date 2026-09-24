import { createUserByAdmin, listUsers } from "../services/user.service.js";
import { toPublicUser } from "../services/auth.service.js";

const adminView = (user) => ({
  ...toPublicUser(user),
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await createUserByAdmin({ name, email, password, role, admin: req.user, req });

  res.status(201).json({ success: true, message: "User created", data: { user: adminView(user) } });
};

export const getUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { users, total } = await listUsers({ role: req.query.role, page, limit });

  res.json({ success: true, data: { users: users.map(adminView), page, limit, total } });
};

import { assignCoordinator } from "../services/user.service.js";

export const assignApplicationCoordinator = async (req, res) => {
  const application = await assignCoordinator({
    applicationId: req.params.id, coordinatorId: req.body.coordinatorId, admin: req.user, req,
  });
  res.json({ success: true, message: "Coordinator assigned", data: { applicationId: application._id, assignedCoordinatorId: application.assignedCoordinatorId } });
};