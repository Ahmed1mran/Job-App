import multer from "multer";
export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword", "application/txt"],
};
export const uploadCloudFile = (fileValidation = []) => {
  const storage = multer.diskStorage({  });

  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb("In-Valid file formate", false);
    }
  }

  return multer({ fileFilter, storage });
};
