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
    chat,
  });
});

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
