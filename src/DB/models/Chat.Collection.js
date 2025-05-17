import mongoose, { Schema, Types } from "mongoose";
import { model } from "mongoose";

const chatSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: Types.ObjectId, ref: "User", required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

chatSchema.pre("findOne", function () {
  this.select("senderId receiverId").populate({
    path: "messages",
    options: { sort: { timestamp: -1 }, limit: 50 },
  });
});

const chatModel = mongoose.models.Chat || model("Chat", chatSchema);
export default chatModel;
