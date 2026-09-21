import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import healthRoutes from "./routes/health.routes.js";
import { connectDB } from "./config/db.js";

if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL is missing in backend/.env");
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.use("/api/health", healthRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`TrahoDoc API running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`TrahoDoc API running on http://localhost:${PORT}`);
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`TrahoDoc API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();