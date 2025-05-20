import express from "express";
import { sendMessageRest } from "./chat.service.js";
import { authentication } from "../../midellware/auth.midellware.js";
import { checkHRorOwner } from "../../midellware/socket.midellware/socket.midellware.js";

const router = express.Router();

router.get(
  "/:userId/company/:companyId",
  authentication(),
  checkHRorOwner(),
  sendMessageRest
);

export default router;
