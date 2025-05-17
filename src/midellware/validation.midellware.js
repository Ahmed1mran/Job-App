import joi from "joi";
import { Types } from "mongoose";
import { genderTypes } from "../DB/models/User.Collection.js";
export const isValidObjectId = (value, helpers) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helpers.message("In-valid Object id");
};
const fileObj = {
  fieldname: joi.string().valid("attachments"),
  originalname: joi.string(),
  encoding: joi.string(),
  mimetype: joi.string(),
  finalPath: joi.string(),
  destination: joi.string(),
  filename: joi.string(),
  path: joi.string(),
  size: joi.number(),
};
export const generalFields = {
  userName: joi.string().min(2).max(50),
  firstName: joi.string().min(2).max(50),
  lastName: joi.string().min(2).max(50),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmationPassword: joi.string().valid(joi.ref("password")),
  confirmPassword: joi.string().valid(joi.ref("password")),
  code: joi.string().pattern(new RegExp(/^\d{4}$/)),
  id: joi.string().custom(isValidObjectId),
  DOB: joi.date().less("now"),
  mobileNumber: joi.string().pattern(new RegExp(/^01[0125][0-9]{8}$/)),
  address: joi.string(),
  gender: joi.string().valid(...Object.values(genderTypes)),
  fileObj,
  file: joi.object().keys(fileObj),

  // company validation

  companyName: joi.string(),
  description: joi.string(),
  companyEmail: joi.string(),
  numberOfEmployees: joi.string(),
  address: joi.string(),
  industry: joi.string(),
  legalAttachment: joi.string(),
  HRs: joi.string(),
  logo: joi.string(),
  coverPic: joi.string(),
  companyId: joi.string(),
  jobId: joi.string(),

  //job validation

  jobTitle: joi.string(),
  jobLocation: joi.string(),
  workingTime: joi.string(),
  seniorityLevel: joi.string(),
  jobDescription: joi.string(),
  technicalSkills: joi.string(),
  softSkills: joi.string(),
  companyId: joi.string(),
  closed: joi.string(),
};

export const validation = (Schema) => {
  return (req, res, next) => {
    const inputs = { ...req.query, ...req.body, ...req.params };
    if (req.file || req.files?.length) {
      inputs.file = req.file || req.files;
    }
    const validationResult = Schema.validate(inputs, { abortEarly: false });
    if (validationResult.error) {
      return res.status(400).json({
        message: "validation error ",
        details: validationResult.error.details,
      });
    }

    return next();
  };
};
