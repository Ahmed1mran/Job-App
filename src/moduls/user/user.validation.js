import joi from "joi";
import { generalFields } from "../../midellware/validation.midellware.js";

export const profileImage = joi.object().keys({

  file:generalFields.file.required()

}).required()
export const getUserData = joi.object().keys({
  // userId: generalFields.id.required(),
});
export const profile = joi.object().keys({
  searchForUser:joi.string()
});
export const updateEmail = joi.object().keys({
  email: generalFields.email.required(),
});
export const resetEmail = joi.object().keys({
  oldCode: generalFields.code.required(),
  newCode: generalFields.code.required(),
});
export const updatepassword = joi.object().keys({
  oldPassword: generalFields.password.required(),
  password: generalFields.password.not(joi.ref("oldPassword ")).required(),
  confirmationPassword: generalFields.confirmPassword
    .valid(joi.ref("password"))
    .required(),
  DOB: joi.date().less("now"),
}).required();
export const updateUserAccount = joi.object().keys({
  userName: generalFields.userName,
  firstName: generalFields.firstName,
  lastName: generalFields.lastName,
  DOB: generalFields.DOB,
  gender: generalFields.gender,
  mobileNumber: generalFields.mobileNumber,
});
