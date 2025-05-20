import { asyncHandler } from "../../../utils/error/error.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import * as dbservice from "../../../DB/db.service.js";
import userModel, {
  providerTypes,
} from "../../../DB/models/User.Collection.js";
import { generateToken } from "../../../utils/security/token.js";
import { OAuth2Client } from "google-auth-library";
import { Types } from "mongoose";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbservice.findOne({
    model: userModel,
    filter: { email, provider: providerTypes.system, deletedAt: null },
    select: "+password",
  });
  if (!user) {
    return next(new Error("In-Valid Account", { cause: 400 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please verify your account first", { cause: 409 }));
  }
  if (!compareHash({ plainText: password, hashValue: user.password })) {
    return next(new Error("In-Valid Account", { cause: 400 }));
  }

  const access_token = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_ACCESS_TOKEN,
    expiresIn: "1h",
  });
  const refresh_token = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_REFRESH_TOKEN,
    expiresIn: "7d",
  });

  return successResponse({
    res,
    data: { token: { access_token, refresh_token } },
  });
});
export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    return next(new Error("Invalid Google Token", { cause: 400 }));
  }
  console.log(payload);
  if (!payload.email_verified) {
    return next(new Error("In-valid Account", { cause: 400 }));
  }

  let user = await dbservice.findOne({
    model: userModel,
    filter: { email: payload.email },
  });

  if (!user) {
    user = await dbservice.create({
      model: userModel,
      data: {
        userName: payload.name,
        email: payload.email,
        confirmEmail: payload.email_verified,
        image: payload.picture,
        provider: providerTypes.google,
      },
    });
  }
  if (user.provider !== providerTypes.google) {
    return next(new Error("In-valid provider", { cause: 400 }));
  }

  const accessToken = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_ACCESS_TOKEN,
    expiresIn: "1h",
  });

  const refreshToken = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_REFRESH_TOKEN,
    expiresIn: "7d",
  });

  return successResponse({
    res,
    message: "Login successful",
    data: {
      Token: { accessToken, refreshToken },
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await dbservice.findOne({
    model: userModel,
    filter: { email, deletedAt: null },
  });

  if (!user || !user.isConfirmed) {
    return next(
      new Error("Invalid account or unverified email", { cause: 404 })
    );
  }

  emailEvent.emit("forgotPassword", { id: user._id, email });
  return successResponse({ res });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await dbservice.findOne({
    model: userModel,
    filter: { email, deletedAt: null },
  });
  if (!user || !user.isConfirmed) {
    return next(
      new Error("Invalid account or unverified email", { cause: 404 })
    );
  }

  await dbservice.updateOne({
    model: userModel,
    filter: { email },
    data: {
      password: generateHash({ plainText: password }),
      changeCredentialTime: Date.now(),
      $unset: { otp: 0 },
    },
  });

  return successResponse({ res });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({ authorization, next });

  if (
    user.changeCredentialTime &&
    new Date(user.changeCredentialTime) > new Date(req.token.iat * 1000)
  ) {
    return next(
      new Error("Token expired due to credential change", { cause: 401 })
    );
  }

  const access_token = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_ACCESS_TOKEN,
    expiresIn: "1h",
  });
  const refresh_token = generateToken({
    payload: { id: user._id, role: user.role },
    signature: process.env.USER_REFRESH_TOKEN,
    expiresIn: "7d",
  });

  return successResponse({
    res,
    data: { token: { access_token, refresh_token } },
  });
});
