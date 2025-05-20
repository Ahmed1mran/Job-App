import mongoose, { Types } from "mongoose";
import { Schema, model } from "mongoose";
import { generateHash } from "../../utils/security/hash.js";
import {
  decodeEncryption,
  generateEncryption,
} from "../../utils/security/encryption.js";

export const roleTypes = {
  user: "User",
  admin: "Admin",
  Owner: "Owner",
  HR: "HR",
};

export const genderTypes = {
  male: "male",
  female: "female",
};

export const providerTypes = { system: "system", google: "google" };

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },

    password: {
      type: String,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },

    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },

    gender: {
      type: String,
      enum: Object.values(genderTypes),
    },

    DOB: {
      type: Date,
      validate: {
        validator: function (value) {
          const age = new Date().getFullYear() - value.getFullYear();
          return age >= 18;
        },
        message: "User must be at least 18 years old",
      },
    },

    mobileNumber: { type: String },

    role: {
      type: String,
      default: roleTypes.user,
      enum: Object.values(roleTypes),
    },

    isConfirmed: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },
    bannedAt: { type: Date, default: null },

    updatedBy: { type: Types.ObjectId, ref: "User" },

    changeCredentialTime: { type: Date },

    profilePic: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },

    otp: [
      {
        code: { type: String, required: true },
        type: {
          type: String,
          enum: ["confirmEmail", "forgetPassword"],
          required: true,
        },
        expiresIn: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema
  .virtual("userName")
  .set(function (value) {
    const nameParts = value.split(" ");
    this.set("firstName", nameParts[0] || "");
    this.set("lastName", nameParts[1] || "");
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
  });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = generateHash({ plainText: this.password });
  }
  if (this.isModified("mobileNumber")) {
    this.mobileNumber = generateEncryption({ plainText: this.mobileNumber });
  }

  next();
});
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.mobileNumber = decodeEncryption(ret.mobileNumber);
    return ret;
  },
});

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
