import * as dbservice from "../../DB/db.service.js";
import companyModel from "../../DB/models/Company.Collection.js";
import { asyncHandler } from "../../utils/error/error.js";
import { cloud } from "../../utils/response/multer/cloudinary.multer.js";
import { paginate } from "../../utils/paginate.js";
import { successResponse } from "../../utils/response/success.response.js";
import jobModel from "../../DB/models/Job.opportunity.Collection.js";
import mongoose from "mongoose";
import applicationModel from "../../DB/models/Application.Collection.js";
import { sendEmail } from "../../utils/email/send.email.js";
import { sendNotification } from "../../utils/notifications.js";

export const addJob = asyncHandler(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
  } = req.body;

  const company = await dbservice.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 400 }));
  }

  if (
    req.user._id.toString() !== company.createdBy.toString() &&
    !company.HRs.includes(req.user._id.toString())
  ) {
    return next(new Error("You cannot add a job", { cause: 403 }));
  }

  const job = await dbservice.create({
    model: jobModel,
    data: {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedByHR: req.user._id,
      updatedByHR: req.user._id,
      companyId,
    },
  });

  return successResponse({
    res,
    message: "Done",
    status: 201,
    data: { job },
  });
});

export const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;

  if (
    !jobId ||
    jobId.length !== 24 ||
    !mongoose.Types.ObjectId.isValid(jobId)
  ) {
    return next(new Error("Invalid job ID", { cause: 400 }));
  }

  const job = await dbservice.findOneAndUpdate({
    model: jobModel,
    filter: {
      _id: jobId,
      addedByHR: req.user._id,
      closed: false,
    },
    data: {
      closed: true,
      updatedByHR: req.user._id,
    },
    options: { new: true },
  });

  return job
    ? successResponse({ res, status: 200, data: { job } })
    : next(
        new Error("Job not found or you are not Hr to update the job", {
          cause: 404,
        })
      );
});
export const UpdateJobData = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { ...otherUpdates } = req.body;

  if (
    !jobId ||
    jobId.length !== 24 ||
    !mongoose.Types.ObjectId.isValid(jobId)
  ) {
    return next(new Error("Invalid job ID", { cause: 400 }));
  }

  delete otherUpdates.addedByHR;
  delete otherUpdates.companyId;

  const job = await dbservice.findOneAndUpdate({
    model: jobModel,
    filter: {
      _id: jobId,
      addedByHR: req.user._id,
      closed: false,
    },
    data: {
      ...otherUpdates,
      updatedByHR: req.user._id,
    },
    options: { new: true },
  });

  return job
    ? successResponse({ res, status: 200, data: { job } })
    : next(new Error("Job not found or not editable", { cause: 404 }));
});

export const getJobs = asyncHandler(async (req, res, next) => {
  const { companyId, jobId } = req.params;
  let { page, limit, sort = "-createdAt", search = "" } = req.query;

  const filter = {};

  if (search) {
    const company = await dbservice.findOne({
      model: companyModel,
      filter: { name: { $regex: search, $options: "i" } },
    });

    if (!company) {
      return next(new Error("Company not found", { cause: 404 }));
    }
    filter.companyId = company._id;
  }

  if (companyId) filter.companyId = companyId;
  if (jobId) filter._id = jobId;

  const { data: jobs, total } = await paginate({
    model: jobModel,
    filter,
    select: "-__v",
    page,
    limit,
  });

  return successResponse({
    res,
    status: 200,
    data: { jobs, total, page, limit },
  });
});
export const getFilteredJobs = asyncHandler(async (req, res, next) => {
  let filter = {};
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;

  if (workingTime) filter.workingTime = { $regex: workingTime, $options: "i" };
  if (jobLocation) filter.jobLocation = { $regex: jobLocation, $options: "i" };
  if (seniorityLevel)
    filter.seniorityLevel = { $regex: seniorityLevel, $options: "i" };
  if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };
  if (technicalSkills)
    filter.technicalSkills = { $regex: technicalSkills, $options: "i" };

  const jobs = await paginate({
    model: jobModel,
    filter,
    req,
  });

  return successResponse({
    res,
    status: 200,
    data: jobs,
  });
});

export const getJobApplications = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { companyId } = req.query;

  const job = await dbservice.findOne({
    model: jobModel,
    filter: { _id: jobId },
    populate: [
      {
        path: "applications",
        populate: { path: "userId", select: "-password" },
      },
    ],
  });

  if (!job) return next(new Error("Job not found", { cause: 404 }));

  const company = await dbservice.findOne({
    model: companyModel,
    filter: { _id: companyId },
    populate: [
      { path: "createdBy", select: "firstName lastName" },
      { path: "HRs", select: "_id firstName lastName" },
    ],
  });

  if (!company) return next(new Error("Company not found", { cause: 404 }));

  if (!hasPermission(req.user._id, company)) {
    return next(new Error("Unauthorized to view applications", { cause: 403 }));
  }

  const { data, total, page, limit } = await paginate({
    model: applicationModel,
    filter: { jobId },
    populate: [{ path: "userId", select: "-password" }],
    page: req.query.page,
    limit: req.query.size,
  });

  return successResponse({
    res,
    message: "Done",
    data: { applications: data, total, page, limit },
  });
});

const hasPermission = (userId, company) => {
  const isOwner =
    company.createdBy && userId.toString() === company.createdBy._id.toString();
  const isHR = company.HRs?.some(
    (hr) => hr._id.toString() === userId.toString()
  );
  return isOwner || isHR;
};

export const applyToJob = asyncHandler(async (req, res, next) => {
  // try {
  const { jobId } = req.params;
  const userId = req.user._id;

  if (req.user.role !== "User") {
    return next(new Error("Only users can apply for jobs", { cause: 403 }));
  }

  const job = await dbservice.findOne({
    model: jobModel,
    filter: { _id: jobId },
    populate: [{ path: "companyId", populate: { path: "HRs", select: "_id" } }],
  });

  if (!job) return next(new Error("Job not found", { cause: 404 }));
  if (job.closed)
    return next(
      new Error("This job is no longer accepting applications", {
        cause: 400,
      })
    );

  const existingApplication = await dbservice.findOne({
    model: applicationModel,
    filter: { jobId, userId },
  });

  if (existingApplication) {
    return next(
      new Error("You have already applied for this job", { cause: 400 })
    );
  }

  if (!req.file) {
    return next(new Error("No file uploaded", { cause: 400 }));
  }

  const uploadResult = await cloud.uploader.upload(req.file.path, {
    resource_type: "auto",
    folder: "job_applications",
  });

  const application = await dbservice.create({
    model: applicationModel,
    data: {
      userId,
      jobId,
      userCV: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
      },
      status: "Pending",
    },
  });

  const io = req.app.get("io");
  job.companyId.HRs.forEach((hr) => {
    if (hr && hr._id) {
      sendNotification(hr._id.toString(), "📩 New job application received!");
    }
  });

  return successResponse({
    res,
    message: "Application submitted successfully",
    data: application,
  });
});
export const acceptOrRejectApplicant = asyncHandler(async (req, res, next) => {
  const { applicationId, companyId } = req.params;
  const { companyStatus, userId } = req.body;
  const hrId = req.user._id;

  const company = await dbservice.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (!company.HRs.some((hr) => hr.equals(hrId))) {
    return next(
      new Error("Only HRs can update application status", { cause: 403 })
    );
  }

  const validStatuses = ["Accepted", "Rejected", "Viewed", "In Consideration"];
  if (!validStatuses.includes(companyStatus)) {
    return next(new Error("Invalid status value", { cause: 400 }));
  }
  const application = await applicationModel
    .findById(applicationId)
    .populate({ path: "userId", select: "email firstName lastName" });

  if (!application) {
    return next(new Error("Application not found", { cause: 404 }));
  }

  application.status = companyStatus;
  await application.save();

  const emailSubject = () => {
    switch (companyStatus) {
      case "Accepted":
        return "Job Application Accepted";
      case "Rejected":
        return "Job Application Rejected";
      case "Viewed":
        return "Job Application Viewed";
      case "In Consideration":
        return "Job Application In Consideration";
      default:
        return "Job Application Pending";
    }
  };

  const emailBody = () => {
    switch (companyStatus) {
      case "Accepted":
        return `Dear ${application.userId.firstName}, congratulations! Your application has been accepted.`;
      case "Rejected":
        return `Dear ${application.userId.firstName}, we regret to inform you that your application has been rejected.`;
      case "Viewed":
        return `Dear ${application.userId.firstName}, your application has been viewed.`;
      case "In Consideration":
        return `Dear ${application.userId.firstName}, your application is in consideration.`;
      default:
        return `Dear ${application.userId.firstName}, your application status has been Pending.`;
    }
  };

  if (!application.userId.email) {
    return next(new Error("Applicant email not found", { cause: 400 }));
  }

  await sendEmail({
    to: application.userId.email,
    subject: emailSubject(),
    body: emailBody(),
  });

  res.json({ message: `Application ${companyStatus} successfully` });
});
