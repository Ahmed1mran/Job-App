import multer from "multer";
import fs from "fs";
import path from "path";

export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword", "text/plain"],
};

export const uploadFileDisk = (customPath = "general", fileValidation = []) => {
  const basePath = path.join("uploads", customPath);
  const fullPath = path.resolve("./src", basePath);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const finalFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
        file.originalname
      }`;
      file.finalPath = path.join(basePath, finalFileName);
      cb(null, finalFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (fileValidation.length === 0 || fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("In-Valid file format"), false);
    }
  };

  return multer({ storage, fileFilter });
};
