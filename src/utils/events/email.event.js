import { customAlphabet } from "nanoid";
import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { confirmEmailTemplateOTP } from "../email/template/confirmEmailOTP.js";
import { generateHash } from "../security/hash.js";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/User.Collection.js";

// إنشاء EventEmitter لإدارة إرسال الإيميلات
export const emailEvent = new EventEmitter();

// تعريف أنواع الـ OTP الممكنة
export const emailSubject = {
  confirmEmail: "confirmEmail",
  resetPassword: "resetPassword",
  updateEmail: "updateEmail",
};

// دالة إرسال كود الـ OTP
export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {
  try {
    const { id, email } = data;

    // توليد كود عشوائي مكون من 4 أرقام
    const otp = customAlphabet("0123456789", 4)();
    
    // تشفير كود الـ OTP
    const hashOTP = generateHash({ plainText: `${otp}` });

    // تحديث بيانات المستخدم في قاعدة البيانات
    const updateData = {
      $push: {
        otp: {
          code: hashOTP,
          type: subject,
          expiresIn: new Date(Date.now() + 10 * 60 * 1000), // صالح لمدة 10 دقائق
        },
      },
    };

    await dbService.updateOne({
      model: userModel,
      filter: { _id: id },
      data: updateData,
    });

    // إنشاء الـ HTML الخاص بالإيميل
    const html = confirmEmailTemplateOTP({ code: otp });

    // إرسال الإيميل
    await sendEmail({ to: email, subject: "Confirm-Email", html });
    // await sendEmail({ to: companyEmail, subject: "Confirm-Company", html });

    console.log("OTP Sent Successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

// الأحداث الخاصة بإرسال أكواد OTP
emailEvent.on("sendConfirmEmailWithOTP", async (data) => {
  await sendCode({ data, subject: emailSubject.confirmEmail });
});

emailEvent.on("updateEmail", async (data) => {
  await sendCode({ data, subject: emailSubject.updateEmail });
});

emailEvent.on("forgotPassword", async (data) => {
  await sendCode({ data, subject: emailSubject.resetPassword });
});
