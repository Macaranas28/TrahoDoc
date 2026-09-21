import mongoose from "mongoose";

export const getHealth = (req, res) => {
  const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    service: "TrahoDoc API",
    database,
    timestamp: new Date().toISOString(),
  });
};