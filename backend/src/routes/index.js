import { Router } from "express";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/health", healthRoutes);
// Later phases add: router.use("/auth", authRoutes); and so on

export default router;