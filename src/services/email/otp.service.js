import { emailEvent } from "./otp.service.js";
import UserModel from "../../../DB/model/User.model.js";
import bcrypt from "bcrypt";

emailEvent.on("verifyOTP", async (data) => {
  const { email, otpCode, subject } = data;
  
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  
  const otpEntry = user.otp.find(
    (otp) => bcrypt.compareSync(otpCode, otp.code) && otp.type === subject
  );
  
  if (!otpEntry) {
    throw new Error("Invalid OTP");
  }
  
  if (new Date() > otpEntry.expiresIn) {
    throw new Error("OTP expired");
  }
  
  user.otp = user.otp.filter((otp) => otp !== otpEntry);
  await user.save();

  console.log("OTP verified successfully for", subject);
});
