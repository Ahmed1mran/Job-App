import mongoose, { Types } from "mongoose";
import { Schema, model } from "mongoose";

export const jobLocation = {
  onsite: "onsite",
  remotely: "remotely",
  hybrid: "hybrid",
};

export const workingTime = {
  partTime: "part-time",
  fullTime: "full-time",
};

export const seniorityLevel = {
  fresh: "fresh",
  Junior: "Junior",
  MidLevel: "Mid-Level",
  Senior: "Senior",
  TeamLead: "Team-Lead",
  CTO: "CTO",
};

const jobSchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocation),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTime),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevel),
      required: true,
    },
    jobDescription: { type: String, required: true },
    technicalSkills: [{ type: String, required: true }],
    softSkills: [{ type: String, required: true }],
    addedByHR: { type: Types.ObjectId, ref: "User", required: true },
    updatedByHR: { type: Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});


const jobModel =
  mongoose.models.jobModel ||
  model("Job", jobSchema);
export default jobModel;
