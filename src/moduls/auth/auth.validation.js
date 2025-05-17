import joi from "joi";
import { generalFields } from "../../midellware/validation.midellware.js";

export const signup = joi
  .object()
  .keys({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    mobileNumber:generalFields.mobileNumber.required(),
    gender:generalFields.gender.required(),
    DOB:generalFields.DOB.required(),
  
  })
  .required();
export const confirmEmail = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
  })
  .required();

export const validateForgotPassword = confirmEmail;

export const login = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    provider: joi.string().valid("system", "google").default("system"),

  })
  .required();

export const forgotPassword = joi.object().keys({
    email: generalFields.email.required(),
  }).required();

export const resetPassword = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref('password')).required(),

  }).required();
