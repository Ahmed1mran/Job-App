import { io, onlineUsers } from "./socket/socket.js"; // تأكد من المسار الصحيح

export const sendNotification = (userId, message) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("notification", { message });
    console.log(`🔔 Sent notification to User ${userId}: ${message}`);
  } else {
    console.log(`⚠️ User ${userId} is offline, notification not sent.`);
  }
};
