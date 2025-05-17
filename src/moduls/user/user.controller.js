import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../midellware/auth.midellware.js";
import * as profileService from "./service/user.service.js";
import { endpoint } from "./user.endpoint.js";
import { validation } from "../../midellware/validation.midellware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import * as validators from "./user.validation.js";
import {fileValidations,uploadFileDisk,} from "../../utils/multer/local.multer.js";
const router = Router();

router.get("/profile/anotherUser/:searchForUser", authentication(),validation(validators.profile), profileService.GetProfileDataForAnotherUser);
router.get("/profile/getUserData/",validation(validators.getUserData),authentication(),profileService.GetLoginUserAccountData);

router.patch(
  "/profile/updatePassword",
  validation(validators.updatepassword),
  authentication(),
  authorization(endpoint.profile),
  profileService.updatepassword
);
router.patch(
  "/profile/updateUserAccount",
  validation(validators.updateUserAccount),
  authentication(),
  profileService.updateUserAccount
);

router.patch(
  "/profile/updateProfilePic",
  authentication(),
  uploadCloudFile(fileValidations.image).single("attachments"),
  validation(validators.profileImage),
  profileService.updateProfilePic
);

router.patch(
  "/cover/updateCoverPic",
  authentication(),
  uploadFileDisk("user/profile", fileValidations.image).single("image"),
  profileService.updateCoverPic
);
router.delete(
  "/profile/DeleteAccount",
  authentication(),
  authorization(endpoint.profile),
  profileService.softDeleteAccount
);
// router.patch(
//   "/unban",
//   authentication(),
//   authorization(endpoint.profile),
//   profileService.unban
// );
router.delete( "/profile/deleteProfilePic", authentication(), profileService.deleteProfilePic);
router.delete( "/cover/pic", authentication(), profileService.deleteCoverPic);


export default router;
