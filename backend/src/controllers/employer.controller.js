import { listAccreditedEmployers } from "../services/employer.service.js";

export const getAccreditedEmployers = async (req, res) => {
  const employers = await listAccreditedEmployers();

  res.json({
    success: true,
    data: {
      employers: employers.map((e) => ({
        id: e._id.toString(),
        companyName: e.companyName,
        industry: e.businessInformation?.industry,
        address: e.businessInformation?.address,
        website: e.businessInformation?.website,
        description: e.businessInformation?.description,
      })),
    },
  });
};