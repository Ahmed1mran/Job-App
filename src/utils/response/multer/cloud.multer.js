import multer from "multer";
const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif"],
  document: ["application/pdf", "application/msword", "application/txt"],
};
export const uploadCloudFile = (fileValidation = []) => {
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb("In-Valid file formate", false);
    }
  }

  return multer({ fileFilter, storage });
};
