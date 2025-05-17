import { Router } from "express";
import * as registrationSerive from "./service/registration.service.js"
import * as login from "./service/login.service.js"
import * as validators  from "./auth.validation.js";
import { validation } from "../../midellware/validation.midellware.js";
const router = Router();

router.post("/signup", validation(validators.signup),registrationSerive.signup)
router.post("/login", validation(validators.login),login.login)
router.patch("/confirmEmailOTP", validation(validators.confirmEmail),registrationSerive.confirmEmail)
router.get("/refresh-token", login.refreshToken)
router.patch("/forgot-password", validation(validators.forgotPassword),login.forgotPassword)
router.patch("/reset-password", validation(validators.resetPassword),login.resetPassword)
router.post("/loginWithGmail", login.loginWithGmail);

export default router;
 