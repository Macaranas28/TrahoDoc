import { listEmployerApplications, getEmployerApplication, respondToApplication } from "../services/application.service.js";
import { toEmployerApplicationView } from "../utils/serializers.js";
import {
  createDraftApplication,
  listMyApplications,
  getMyApplication,
  submitMyApplication,
  withdrawMyApplication,
} from "../services/application.service.js";
import { toApplicationSummary, toApplicationDetail } from "../utils/serializers.js";
import { listCoordinatorApplications, getCoordinatorApplication, changeApplicationStatus } from "../services/application.service.js";

export const createApplication = async (req, res) => {
  const application = await createDraftApplication({
    user: req.user,
    employerId: req.body.employerId, // the only field we read
    req,
  });
  res.status(201).json({
    success: true,
    message: "Application created",
    data: { application: toApplicationDetail(application) },
  });
};

export const listMine = async (req, res) => {
  const applications = await listMyApplications(req.user);
  res.json({ success: true, data: { applications: applications.map(toApplicationSummary) } });
};

export const getOne = async (req, res) => {
  const application = await getMyApplication({ user: req.user, id: req.params.id });
  res.json({ success: true, data: { application: toApplicationDetail(application) } });
};

export const submit = async (req, res) => {
  const application = await submitMyApplication({ user: req.user, id: req.params.id, req });
  res.json({ success: true, message: "Application submitted", data: { application: toApplicationDetail(application) } });
};

export const withdraw = async (req, res) => {
  const application = await withdrawMyApplication({
    user: req.user,
    id: req.params.id,
    remarks: req.body?.remarks,
    req,
  });
  res.json({ success: true, message: "Application withdrawn", data: { application: toApplicationDetail(application) } });
};

export const listForEmployer = async (req, res) => {
  const applications = await listEmployerApplications(req.user);
  res.json({ success: true, data: { applications: applications.map(toEmployerApplicationView) } });
};

export const getOneForEmployer = async (req, res) => {
  const application = await getEmployerApplication({ user: req.user, id: req.params.id });
  res.json({ success: true, data: { application: toEmployerApplicationView(application) } });
};

export const employerRespond = async (req, res) => {
  const application = await respondToApplication({
    user: req.user,
    id: req.params.id,
    status: req.body.status,
    remarks: req.body.remarks,
    req,
  });
  res.json({ success: true, message: "Response recorded", data: { application: toEmployerApplicationView(application) } });
};

export const listForCoordinator = async (req, res) => {
  const applications = await listCoordinatorApplications(req.user);
  res.json({
    success: true,
    data: {
      applications: applications.map((a) => ({
        id: a._id.toString(),
        status: a.status,
        employer: { companyName: a.employerId?.companyName },
        student: { name: a.studentId?.name, course: a.studentId?.studentProfile?.course },
        createdAt: a.createdAt,
      })),
    },
  });
};

export const getOneForCoordinator = async (req, res) => {
  const application = await getCoordinatorApplication({ user: req.user, id: req.params.id });
  res.json({ success: true, data: { application: toApplicationDetail(application) } }); // reuse existing serializer
};

export const changeStatus = async (req, res) => {
  const application = await changeApplicationStatus({
    user: req.user, id: req.params.id, status: req.body.status, remarks: req.body.remarks, req,
  });
  res.json({ success: true, message: "Status updated", data: { application: { id: application._id, status: application.status } } });
};