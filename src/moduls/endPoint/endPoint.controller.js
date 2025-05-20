import express from "express";
import { endpoint } from "./endPoint.service.js";

const router = express.Router();

router.get("/company/:companyId/applications/:date", endpoint);

export default router;
