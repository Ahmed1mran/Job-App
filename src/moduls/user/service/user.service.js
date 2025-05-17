import { asyncHandler } from "../../../utils/error/error.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import userModel from "../../../DB/models/User.Collection.js";
import { cloud } from "../../../utils/response/multer/cloudinary.multer.js";
import {
  decodeEncryption,
  generateEncryption,
} from "../../../utils/security/encryption.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import bcrypt from "bcrypt";

// جلب بيانات الحساب مع إرجاع الرقم غير المشفر
export const GetProfileDataForAnotherUser = asyncHandler(async (req, res, next) => {
  const {searchForUser} =req.params
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: searchForUser },
    select: "firstName lastName mobileNumber profilePic coverPic",
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));
  const userData = {
    ...user.toObject(),
    mobileNumber: decodeEncryption({ cipherText: user.mobileNumber }), // فك التشفير
  };

  return successResponse({
    res,
    data: {
      userName: userData.firstName + " " + userData.lastName,
      mobileNumber: userData.mobileNumber,
    },
  });
});
// جلب بيانات مستخدم آخر مع إظهار الرقم الحقيقي
export const GetLoginUserAccountData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new Error("User not authenticated", { cause: 401 }));
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id },
    select: "-password -otp",
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

    const userData = {
      ...user.toObject(),
      mobileNumber: decodeEncryption({ cipherText: user.mobileNumber }), // فك التشفير
    };
  return userData
    ? successResponse({ res, data: { userData  } })
    : next(new Error("In-valid account", { cause: 404 }));
});

// تحديث بيانات المستخدم مع تشفير رقم الهاتف الجديد
export const updateUserAccount = asyncHandler(async (req, res, next) => {
  const { mobileNumber, ...otherUpdates } = req.body;
  let updateData = { ...otherUpdates };

  if (mobileNumber) {
    updateData.mobileNumber = generateEncryption({ plainText: mobileNumber }); // تشفير الرقم الجديد
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: updateData,
    options: { new: true },
  });

  return successResponse({ res, data: { user } });
});

export const updatepassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;
  if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
    return next(new Error("In-valid user password ", { cause: 400 }));
  }
  const hashPassword = generateHash({ plainText: password });
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: hashPassword,
      changePasswordTime: Date.now(),
      $unset: { otp: 0 },
    },
    { new: true }
  );

  return successResponse({ res, data: { user } });
});

// رفع صورة البروفايل
export const updateProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No file uploaded", { cause: 400 }));

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/profile`,
  });

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { profilePic: { secure_url, public_id } },
    options: { new: true },
  });

  return successResponse({ res, data: { user } });
});

// رفع صورة الغلاف
export const updateCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("No file uploaded", { cause: 400 }));

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/cover`,
  });

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { coverPic: { secure_url, public_id } },
    options: { new: true },
  });

  return successResponse({ res, data: { user } });
});

// حذف صورة البروفايل
export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id },
  });

  if (!user.profilePic)
    return next(new Error("No profile picture found", { cause: 404 }));

  await cloud.uploader.destroy(user.profilePic.public_id);

  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { profilePic: null },
    options: { new: true },
  });

  return successResponse({
    res,
    message: "Profile picture deleted successfully",
  });
});

// حذف صورة الغلاف
export const deleteCoverPic = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id },
  });

  if (!user.coverPic)
    return next(new Error("No cover picture found", { cause: 404 }));

  await cloud.uploader.destroy(user.coverPic.public_id);

  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { coverPic: null },
    options: { new: true },
  });

  return successResponse({
    res,
    message: "Cover picture deleted successfully",
  });
});

// حذف الحساب بطريقة Soft Delete
export const softDeleteAccount = asyncHandler(async (req, res, next) => {

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { deletedAt: Date.now() },
    options: { new: true },
  });
  if (user.deletedAt) {
    return next(new Error("Account is Deleted", { cause: 404 }));
    
  }
  return successResponse({ res, message: "Account deleted successfully" });
});

// export const unban = asyncHandler(async (req, res, next) => {
//   const { baned } = req.body;

//   if (req.user.role !== "Admin") {
//     return next(new Error("You're not authorized to unban users", { cause: 403 }));
//   }

//   // البحث عن المستخدم قبل التحديث
//   const userbaned = await dbService.findOne({
//     model: userModel,
//     filter: { _id: baned },
//   });

//   if (!userbaned) {
//     return next(new Error("User not found", { cause: 404 }));
//   }

//   if (userbaned.deletedAt === null) {
//     return next(new Error("User is already unbanned", { cause: 400 }));
//   }

//   // تحديث المستخدم لإلغاء الحظر
//   const updatedUser = await dbService.findOneAndUpdate({
//     model: userModel,
//     filter: { _id: baned },
//     data: { deletedAt: null },
//     options: { new: true },
//   });

//   return successResponse({ res, message: "Account unbanned successfully" });
// });


