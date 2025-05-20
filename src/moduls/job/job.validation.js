import joi from "joi";
import { generalFields } from "../../midellware/validation.midellware.js";

export const UpdateJobData = joi
  .object()
  .keys({
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
    jobId: generalFields.jobId.required(),
  })
  .required();
export const addJob = joi
  .object()
  .keys({
    jobTitle: generalFields.jobTitle.required(),
    jobLocation: generalFields.jobLocation.required(),
    workingTime: generalFields.workingTime.required(),
    seniorityLevel: generalFields.seniorityLevel.required(),
    jobDescription: generalFields.jobDescription.required(),
    technicalSkills: generalFields.technicalSkills.required(),
    softSkills: generalFields.softSkills.required(),
    companyId: generalFields.companyId.required(),
  })
  .required();

export const SoftDeleteCompany = joi
  .object()
  .keys({
    companyId: generalFields.companyId,
  })
  .required();
export const AddHRS = joi
  .object()
  .keys({
    id: generalFields.id.required(),
    companyName: generalFields.companyName.required(),
  })
  .required();
export const SearchForCompanyByName = joi
  .object()
  .keys({
    companyName: generalFields.companyName.required(),
  })
  .required();
export const logo = joi
  .object()
  .keys({
    companyId: generalFields.companyId.required(),

    file: generalFields.file.required(),
  })
  .required();
export const coverPic = logo;
