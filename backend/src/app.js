import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { csrfGuard } from "./middleware/csrfGuard.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
  })
);
app.use("/api", apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/api", csrfGuard);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;