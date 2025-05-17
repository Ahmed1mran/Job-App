import { Router } from "express";
import * as companyService from "./company.service.js";
import * as validators from "./company.validation.js";
import { validation } from "../../midellware/validation.midellware.js";
import { authentication } from "../../midellware/auth.midellware.js";
import {
  fileValidations,
} from "../../utils/response/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
const router = Router();

router.post(
  "/addCompany",
  authentication(),
  validation(validators.addCompany),
  companyService.addCompany
);
router.post(
  "/AddHRs/:companyName",
  authentication(),
  validation(validators.AddHRS),
  companyService.AddHRS
);
router.patch(
  "/updateCompany/:companyId",
  authentication(),
  companyService.UpdateCompanyData
);
router.delete(
  "/deleteCompany/:companyId",
  authentication(),
  validation(validators.SoftDeleteCompany),
  companyService.SoftDeleteCompany
);
router.get(
  "/getCompanies-with-jobs",
  authentication(),
  companyService.GetSpecificCompanyWithRelatedJobs
);
router.get(
  "/SearchForCompanyByName/:companyName",
  authentication(),
  validation(validators.SearchForCompanyByName),
  companyService.SearchForCompanyByName
);

router.patch(
  "/upload-logo/:companyId",
  authentication(),
  uploadCloudFile(fileValidations.image).single("attachments"),
  validation(validators.logo),
  companyService.uploadCompanyLogo
);
router.patch(
  "/upload-cover/:companyId",
  authentication(),
  uploadCloudFile(fileValidations.image).single("attachments"),
  validation(validators.logo),
  companyService.uploadCompanyCoverPic
);
router.delete(
  "/delete-logo/:companyId",
  authentication(),
  companyService.deleteCompanyLogo
);
router.delete(
  "/delete-Cover/:companyId",
  authentication(),
  companyService.deleteCompanyCoverPic
);

export default router;
