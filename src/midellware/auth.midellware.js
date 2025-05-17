
import { asyncHandler } from "../utils/error/error.js";
import { decodedToken, tokenTypes } from "../utils/security/token.js";

export const userRoles = {
  user: "User",
  admin: "Admin",
  HR:"HR",
  Owner:"Owner"
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    req.user = await decodedToken({
      authorization,
      tokenType: tokenTypes.access,
      req,
      next,
    });
    return next();
  });
};
export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not Authorized account", { cause: 403 }));
    }
    return next();
  });
};
