import userModel, {
  providerTypes,
} from "../../../DB/models/User.Collection.js";
import * as dbservice from "../../../DB/db.service.js";
import { asyncHandler } from "../../../utils/error/error.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash } from "../../../utils/security/hash.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password, mobileNumber, gender, DOB } = req.body;

  if (await dbservice.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists", { cause: 400 }));
  }

  const user = await dbservice.save({
    model: userModel,
    data: {
      userName,
      email,
      password,
      mobileNumber,
      gender,
      DOB,
      provider: providerTypes.system,
    },
  });

  emailEvent.emit("sendConfirmEmailWithOTP", { id: user._id, email });
  return successResponse({
    res,
    message: "Done, please check your Email",
    status: 201,
    data: { user },
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;

  const user = await dbservice.findOne({ model: userModel, filter: { email } });
  if (!user) {
    return next(new Error("Invalid account", { cause: 400 }));
  }

  if (user.isConfirmed) {
    return next(new Error("Already verified", { cause: 409 }));
  }

  const otpEntry = user.otp.find(
    (otp) =>
      compareHash({ plainText: code, hashValue: otp.code }) &&
      otp.type === "confirmEmail"
  );

  if (!otpEntry) {
    return next(new Error("Invalid code", { cause: 400 }));
  }

  if (new Date() > otpEntry.expiresIn) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  await dbservice.updateOne({
    model: userModel,
    filter: { email },
    data: { isConfirmed: true, $unset: { otp: 0 } },
  });

  return successResponse({ res, message: "Email verified successfully" });
});
