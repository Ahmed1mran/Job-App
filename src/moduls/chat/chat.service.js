

import chatModel from "../../DB/models/Chat.Collection.js";
import { asyncHandler } from "../../utils/error/error.js";
import * as dbservice from "../../DB/db.service.js";
import { io } from "../../utils/socket/socket.js";
import { isAuthorizedToChat } from "../../utils/chat/chat.utils.js";
import { onlineUsers } from "../../utils/socket/socket.js";

export const getChatHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const chat = await chatModel.findOne({
    $or: [
      { senderId: currentUserId, receiverId: userId },
      { senderId: userId, receiverId: currentUserId },
    ],
  });

  if (!chat) {
    return next(new Error("No chat history found", { cause: 404 }));
  }

  res.json({
    // message: "Chat history retrieved successfully",
    chat,
  });
});
// export const startconversation = asyncHandler(async (req, res, next) => {
//   const { userId } = req.params;
//   const currentUserId = req.user._id;

//   let chat = await chatModel.findOne({
//     $or: [
//       { senderId: currentUserId, receiverId: userId },
//       { senderId: userId, receiverId: currentUserId },
//     ],
//   }).populate("messages")
//   console.log("Found chat:", chat);

//   if (!chat) {
//     chat = await chatModel.create({ senderId: currentUserId, receiverId: userId, messages: [] });
//   }
//   console.log("Checking existing chat between:", currentUserId, "and", userId);

// // بعد إنشاء المحادثة الجديدة
// const receiverSocketId = onlineUsers.get(userId);
// if (receiverSocketId) {
//   io.to(receiverSocketId).emit("chat_started", chat);
// }
// await chat.save()

//   res.json({
//     message: "Chat started successfully",
//     chat,
//   });
// });

// مثال REST endpoint لإرسال رسالة في chat.service.js
export const sendMessageRest = asyncHandler(async (req, res, next) => {
  const { chatId, senderId, message } = req.body;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return next(new Error("Chat not found", { cause: 404 }));
  }
  chat.messages.push({ senderId, message, timestamp: new Date() });
  await chat.save();
  res.json({
    message: "Message sent successfully",
    chat,
  });
});
