import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";
import { listNotificationsRules } from "../validators/notification.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Any logged-in role may use this, but each user only ever sees their own
router.use(authenticate);

router.get("/", listNotificationsRules, validate, getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", idParam, validate, markNotificationRead);

export default router;