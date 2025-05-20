import { Server } from "socket.io";
import chatModel from "../../DB/models/Chat.Collection.js";
import userModel from "../../DB/models/User.Collection.js";
import { isAuthorizedToChat } from "../../utils/chat/chat.utils.js";

let io;
const onlineUsers = new Map(); 

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id); 
      console.log(`✅ User ${userId} joined with Socket ID: ${socket.id}`);
    });

    
    socket.on("start_chat", async ({ senderId, receiverId }) => {
      try {
        const sender = await userModel.findById(senderId);
        if (!sender || !isAuthorizedToChat(sender)) {
          return socket.emit("chat_error", { message: "Unauthorized to start chat" });
        }

        let chat = await chatModel.findOne({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        });

        if (!chat) {
          chat = await chatModel.create({ senderId, receiverId, messages: [] });
        }

        socket.join(chat._id.toString());
        socket.emit("chat_started", chat);
      } catch (error) {
        console.error("❌ Error starting chat:", error);
      }
    });

    socket.on("sendMessage", async ({ chatId, senderId, message }) => {
      try {
        console.log(`📩 Receiving message: ${message} from ${senderId} to chat ${chatId}`);
    
        const chat = await chatModel.findById(chatId);
        if (!chat) {
          return socket.emit("chat_error", { message: "Chat not found" });
        }
    
        chat.messages.push({ senderId, text: message, timestamp: new Date() });
        await chat.save();
    
        console.log(`✅ Message saved in chat ${chatId}`);
        console.log(chat.messages); 
    
        io.to(chatId).emit("new_message", { senderId, message });
    
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });
    

    //  مغادرة المستخدم للمحادثة
    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId);
      console.log(`User left chat ${chatId}`);
    });

    //  حذف المستخدم عند قطع الاتصال
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} disconnected.`);
          break;
        }
      }
    });
    
  });

  return io;
};

export { io, onlineUsers };
