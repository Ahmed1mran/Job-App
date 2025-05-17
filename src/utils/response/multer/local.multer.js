import multer from "multer";
import fs from "node:fs";
import path from "node:path";
export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif"],
  document: ["application/pdf", "application/msword", "application/txt"],
};
export const uploadFileDisk = (customPath = "general", fileValidation = []) => {
  const basePath = `uploads/${customPath}`;
  const fullPath = path.resolve(`./src/${basePath}`);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },

    filename: (req, file, cb) => {
      const finalFileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;
      file.finalPath = basePath + "/" + finalFileName;
      cb(null, finalFileName);
    },
  });

  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb("In-Valid file formate", false);
    }
  }

  return multer({ fileFilter, storage });
};
