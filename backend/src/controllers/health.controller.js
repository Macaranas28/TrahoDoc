export const getHealth = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TrahoDoc API",
    timestamp: new Date().toISOString(),
  });
};