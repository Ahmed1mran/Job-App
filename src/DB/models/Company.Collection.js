import mongoose, { Types } from "mongoose";
import { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    companyName: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    address: { type: String, required: true },
    numberOfEmployees: {
      type: String,
      enum: ["1-10", "11-20", "21-50", "51-100", "100+"],
      required: true,
    },
    companyEmail: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    logo: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    HRs: [{ type: Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
    bannedAt: { type: Date, default: null },
    legalAttachment: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    approvedByAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

companySchema.index({ companyName: 1 }, { unique: true });
companySchema.index({ companyEmail: 1 }, { unique: true });
// حذف جميع الطلبات المرتبطة بالشركة تلقائيًا عند حذفها
companySchema.pre("findOneAndDelete", async function (next) {
  const company = await this.model.findOne(this.getFilter());
  if (company) {
    await applicationModel.deleteMany({ companyId: company._id });
  }
  next();
});
const companyModel = mongoose.models.Company || model("Company", companySchema);
export default companyModel;
