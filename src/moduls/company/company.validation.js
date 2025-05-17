import joi from "joi";
import { generalFields } from "../../midellware/validation.midellware.js";

export const addCompany = joi
  .object()
  .keys({
    companyName: generalFields.companyName.required(),
    companyEmail: generalFields.companyEmail.required(),
    description: generalFields.description.required(),
    legalAttachment: generalFields.legalAttachment.required(),
    industry: generalFields.industry.required(),
    coverPic: generalFields.coverPic,
    numberOfEmployees: generalFields.numberOfEmployees,
    HRs: generalFields.HRs,
    address: generalFields.address,
    logo: generalFields.logo,
  })
  .required();
export const SoftDeleteCompany = joi
  .object()
  .keys({

    companyId:generalFields.companyId
  })
  .required();
export const AddHRS = joi .object() .keys({
    id:generalFields.id.required(),
    companyName:generalFields.companyName.required()
  }).required();
export const SearchForCompanyByName = joi .object() .keys({

    companyName:generalFields.companyName.required()
  }).required();
  export const logo = joi.object().keys({

    companyId:generalFields.companyId.required(),

    file:generalFields.file.required()
  
  }).required()
  export const coverPic = logo