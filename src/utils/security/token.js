import jwt from "jsonwebtoken";
import * as dbService from "../../DB/db.service.js";
import { asyncHandler } from "../error/error.js";
import userModel from "../../DB/models/User.Collection.js";

export const generateToken = ({
  payload = {},  // 🔹 خلي الافتراضي Object فارغ بدل من String
  signature = process.env.USER_ACCESS_TOKEN,
  expiresIn = "30min",
} = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: Must be an object");
  }
  const token = jwt.sign(payload, signature, { expiresIn });
  return token;
};


export const verifyToken2 = (token) => {
  try {
    if (!token) {
      throw new Error("Token is missing");
    }

    const cleanToken = token.replace("Bearer ", "").trim(); // إزالة "Bearer " إذا كانت موجودة
    const decoded = jwt.verify(cleanToken, process.env.USER_ACCESS_TOKEN);

    return decoded;
  } catch (error) {
    console.error("Failed to verify token:", error.message);
    return null;
  }
};


export const verifyToken = ({
  token = "",
  signature = process.env.USER_ACCESS_TOKEN,
} = {}) => {
  try {
    if (!token || !signature) {
      throw new Error("Missing token or signature");
    }
    const decoded = jwt.verify(token, signature);
    return decoded;
  } catch (error) {
    throw new Error(`Failed to verify token: ${error.message}`);

    return null;
  }
};

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};
export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next,
} = {}) => {
  if (!authorization)
    return next(new Error("authorization is required", { cause: 400 }));

  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(
      new Error("Authorization is required or invalid formated", {
        cause: 400,
      })
    );
  }
  let accessSignature = "";
  let refreshSignature = "";
  switch (bearer) {
    case "System":
      accessSignature = process.env.ADMIN_ACCESS_TOKEN;
      refreshSignature = process.env.ADMIN_REFRESH_TOKEN;
      break;
    case "Bearer":
      accessSignature = process.env.USER_ACCESS_TOKEN;
      refreshSignature = process.env.USER_REFRESH_TOKEN;
      break;
    default:
      return next(new Error("Invalid token payload", { cause: 400 }));
  }
  const decoded = verifyToken({
    token,
    signature: tokenType == tokenTypes.access ? accessSignature : refreshSignature,
  });

  if (!decoded.id)
    return next(new Error("Invalid token payload", { cause: 400 }));
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id  },
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (
    decoded.iat < parseInt(user.changeCridentialTime?.getTime() / 1000) ||
    0
  ) {
    return next(new Error("Please login again", { cause: 400 }));
  }

  return user;
};
