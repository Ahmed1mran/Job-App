import * as dbservice from "../../DB/db.service.js";
import companyModel from "../../DB/models/Company.Collection.js";
import userModel from "../../DB/models/User.Collection.js";
import { asyncHandler } from "../../utils/error/error.js";
import { emailEvent } from "../../utils/events/email.event.js";
import { cloud } from "../../utils/response/multer/cloudinary.multer.js";
import { paginate } from "../../utils/paginate.js";
import { successResponse } from "../../utils/response/success.response.js";

export const addCompany = asyncHandler(async (req, res, next) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    coverPic,
    logo,
  } = req.body;

  if (
    await dbservice.findOne({ model: companyModel, filter: { companyEmail } })
  ) {
    return next(new Error("Email already exists", { cause: 400 }));
  }

  const company = await dbservice.create({
    model: companyModel,
    data: {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      logo,
      coverPic,
      createdBy: req.user._id,
    },
  });
  const owner = await dbservice.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { role: "Owner" },
  });

  return successResponse({
    res,
    message:
      "Done, Your Company Created Successfully And Your Role Become An Owner",
    status: 201,
    data: { company },
  });
});
export const AddHRS = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const { companyName } = req.params;

  let company = await dbservice.findOne({
    model: companyModel,
    filter: { companyName },
  });
  if (!company) {
    return next(new Error("Company Not Found", { cause: 400 }));
  }
  const user = await dbservice.findOne({
    model: userModel,
    filter: { _id: id, deletedAt: null },
  });
  if (!user) {
    return next(new Error("Account not found", { cause: 400 }));
  }

  if (company.HRs.includes(id)) {
    return next(
      new Error("this account is already HR in this company", { cause: 400 })
    );
  }
  company = await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { companyName },
    data: {
      $push:{HRs: id,}
    },
  });

  return successResponse({
    res,
    message: "Done, Added successfully",
    status: 201,
    data: { company },
  });
});

export const UpdateCompanyData = asyncHandler(async (req, res, next) => {
  const { ...otherUpdates } = req.body;
  const { companyId } = req.params;

  const company = await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: {
      _id: companyId,
      createdBy: req.user._id,
      deletedAt: null,
    },
    data: {
      ...req.body,
      updatedBy: req.user._id,
    },
    options: { new: true },
  });
  return company
    ? successResponse({ res, status: 200, data: { company } })
    : next(new Error("company not found", { cause: 404 }));
});

export const SoftDeleteCompany = asyncHandler(async (req, res, next) => {
  const company = await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { createdBy: req.user._id, deletedAt: null },
    data: { deletedAt: Date.now() },
    options: { new: true },
  });

  if (!company) {
    return next(
      new Error(
        "Company not found or already deleted or Deleting the company is not your business ",
        { cause: 404 }
      )
    );
  }

  return successResponse({
    res,
    message: "Company deleted successfully",
    data: company,
  });
});

export const GetSpecificCompanyWithRelatedJobs = asyncHandler(
  async (req, res, next) => {
    let { page, size } = req.query;

    const data = await paginate({
      model: companyModel,
      filter: {
        deletedAt: null,
      },
    });
    console.log(data);
    return successResponse({
      res,
      status: 200,
      data,
    });
  }
);
export const SearchForCompanyByName = asyncHandler(async (req, res, next) => {
  let { companyName } = req.params;

  const response = await dbservice.findOne({
    model: companyModel,
    filter: { companyName, deletedAt: null },
  });

  if (!response) {
    return next(new Error("Company not found", { cause: 400 }));
  }

  return successResponse({
    res,
    status: 200,
    data: response,
  });
});

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No file uploaded", { cause: 400 }));

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/company/${req.user._id}/logo`,
  });
  const { companyId } = req.params;
  const company = await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: { logo: { secure_url, public_id } },
    options: { new: true },
  });

  return successResponse({
    res,
    data: { file: req.file, companyData: company },
  });
});
export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No file uploaded", { cause: 400 }));

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/company/${req.user._id}/logo`,
  });
  const { companyId } = req.params;
  const company = await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: { coverPic: { secure_url, public_id } },
    options: { new: true },
  });

  return successResponse({
    res,
    data: { file: req.file, companyData: company },
  });
});

export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;

  const company = await dbservice.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });

  if (!company.logo) return next(new Error("No Logo found", { cause: 404 }));

  await cloud.uploader.destroy(company.logo.public_id);

  await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: { logo: null },
    options: { new: true },
  });

  return successResponse({
    res,
    message: "Logo deleted successfully",
  });
});

export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await dbservice.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });

  if (!company.coverPic)
    return next(new Error("No cover picture found", { cause: 404 }));

  await cloud.uploader.destroy(company.coverPic.public_id);

  await dbservice.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: { coverPic: null },
    options: { new: true },
  });

  return successResponse({
    res,
    message: "Cover picture deleted successfully",
  });
});
