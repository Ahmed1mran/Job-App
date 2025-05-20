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

export const GetProfileDataForAnotherUser = asyncHandler(
  async (req, res, next) => {
    const { searchForUser } = req.params;
    const user = await dbService.findOne({
      model: userModel,
      filter: { _id: searchForUser },
      select: "firstName lastName mobileNumber profilePic coverPic",
    });

    if (!user) return next(new Error("User not found", { cause: 404 }));
    const userData = {
      ...user.toObject(),
      mobileNumber: decodeEncryption({ cipherText: user.mobileNumber }),
    };

    return successResponse({
      res,
      data: {
        userName: userData.firstName + " " + userData.lastName,
        mobileNumber: userData.mobileNumber,
      },
    });
  }
);
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
    mobileNumber: decodeEncryption({ cipherText: user.mobileNumber }),
  };
  return userData
    ? successResponse({ res, data: { userData } })
    : next(new Error("In-valid account", { cause: 404 }));
});

export const updateUserAccount = asyncHandler(async (req, res, next) => {
  const { mobileNumber, ...otherUpdates } = req.body;
  let updateData = { ...otherUpdates };

  if (mobileNumber) {
    updateData.mobileNumber = generateEncryption({ plainText: mobileNumber });
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
