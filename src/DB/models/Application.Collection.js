import mongoose, { Types } from "mongoose";
import { Schema, model } from "mongoose";

export const status = {
  pending: "Pending",
  accepted: "Accepted",
  viewed: "Viewed",
  inConsideration: "In Consideration",
  rejected: "Rejected",
};
const applicationSchema = new Schema(
  {
    jobId: { type: Types.ObjectId, ref: "Job", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    userCV: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    status: {
      type: String,
      enum: Object.values(status),
      default: status.pending,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const applicationModel =
  mongoose.models.Application || model("Application", applicationSchema);
export default applicationModel;
