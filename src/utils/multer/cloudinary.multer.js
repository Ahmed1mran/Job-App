import path from "node:path";
import * as dotenv from "dotenv";
// dotenv.config({ path: path.join("../../config/.env.DEV") });
dotenv.config();
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export const cloud = cloudinary.v2;