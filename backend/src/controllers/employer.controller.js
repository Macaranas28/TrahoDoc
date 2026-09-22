import { getAccreditedEmployers, getOrNull, upsertEmployerProfile, submitEmployerForReview } from "../services/employer.service.js";
import ApiError from "../utils/ApiError.js";

const toProfileView = (e) => ({
  id: e._id.toString(),
  companyName: e.companyName,
  contactPerson: e.contactPerson,
  email: e.email,
  phone: e.phone,
  businessInformation: e.businessInformation,
  accreditationStatus: e.accreditationStatus,
  accreditationRemarks: e.accreditationRemarks,
});

export const getMyEmployerProfile = async (req, res) => {
  const employer = await getOrNull(req.user._id);
  if (!employer) {
    return res.json({ success: true, data: { profile: null } }); // not created yet: not an error
  }
  res.json({ success: true, data: { profile: toProfileView(employer) } });
};

export const updateMyEmployerProfile = async (req, res) => {
  const { companyName, contactPerson, phone, address, industry, website, description } = req.body;
  const employer = await upsertEmployerProfile({
    user: req.user, companyName, contactPerson, phone, address, industry, website, description, req,
  });
  res.json({ success: true, message: "Company profile saved", data: { profile: toProfileView(employer) } });
};

export const submitMyEmployerForReview = async (req, res) => {
  const employer = await submitEmployerForReview({ user: req.user, req });
  res.json({ success: true, message: "Submitted for review", data: { profile: toProfileView(employer) } });
};

export const getAccreditedEmployersList = async (req, res) => {
  const employers = await getAccreditedEmployers();
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