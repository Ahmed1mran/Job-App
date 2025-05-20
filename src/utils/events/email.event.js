import { customAlphabet } from "nanoid";
import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { confirmEmailTemplateOTP } from "../email/template/confirmEmailOTP.js";
import { generateHash } from "../security/hash.js";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/User.Collection.js";

export const emailEvent = new EventEmitter();

export const emailSubject = {
  confirmEmail: "confirmEmail",
  resetPassword: "resetPassword",
  updateEmail: "updateEmail",
};

export const sendCode = async ({
  data = {},
  subject = emailSubject.confirmEmail,
} = {}) => {
  try {
    const { id, email } = data;

    const otp = customAlphabet("0123456789", 4)();

    const hashOTP = generateHash({ plainText: `${otp}` });

    const updateData = {
      $push: {
        otp: {
          code: hashOTP,
          type: subject,
          expiresIn: new Date(Date.now() + 10 * 60 * 1000),
        },
      },
    };

    await dbService.updateOne({
      model: userModel,
      filter: { _id: id },
      data: updateData,
    });

    const html = confirmEmailTemplateOTP({ code: otp });

    await sendEmail({ to: email, subject: "Confirm-Email", html });

    console.log("OTP Sent Successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

emailEvent.on("sendConfirmEmailWithOTP", async (data) => {
  await sendCode({ data, subject: emailSubject.confirmEmail });
});

emailEvent.on("updateEmail", async (data) => {
  await sendCode({ data, subject: emailSubject.updateEmail });
});

emailEvent.on("forgotPassword", async (data) => {
  await sendCode({ data, subject: emailSubject.resetPassword });
});
