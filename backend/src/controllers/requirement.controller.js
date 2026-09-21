import { listRequirementsFor } from "../services/requirement.service.js";

export const getRequirements = async (req, res) => {
  const requirements = await listRequirementsFor(req.user);

  res.json({
    success: true,
    data: {
      requirements: requirements.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        description: r.description,
        appliesTo: r.appliesTo,
        isRequired: r.isRequired,
      })),
    },
  });
};