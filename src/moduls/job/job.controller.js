import { Router } from "express";
import * as jobService from "./job.service.js";
import * as validators from "./job.validation.js";
import { validation } from "../../midellware/validation.midellware.js";
import { authentication } from "../../midellware/auth.midellware.js";
import { fileValidations } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";

const router = Router();

router.post(
  "/addJob",
  authentication(),
  validation(validators.addJob),
  jobService.addJob
);
router.patch(
  "/UpdateJobData/:jobId",
  authentication(),
  validation(validators.UpdateJobData),
  jobService.UpdateJobData
);
router.delete("/deleteJob/:jobId", authentication(), jobService.deleteJob);

router.get("/getJobs/:jobId?", jobService.getJobs);
router.get("/companies/:companyId/jobs/:jobId?", jobService.getJobs);

router.get("/filterJobs", jobService.getFilteredJobs);

router.get(
  "/job/:jobId/applications",
  authentication(),
  jobService.getJobApplications
);

router.post(
  "/job/:jobId/apply",
  authentication(),
  uploadCloudFile(fileValidations.document).single("attachments"),
  jobService.applyToJob
);
router.put(
  "/company/:companyId/applicationResponse/:applicationId",
  authentication(),
  jobService.acceptOrRejectApplicant
);
export default router;
