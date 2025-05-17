import express from "express";
import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join("./src/config/.env.DEV") });
import bootstrap from "./src/app.controller.js";
import { initSocket } from "./src/utils/socket/socket.js";

const app = express();
const port = 4000;

bootstrap(app, express);

app.get("/", (req, res) => res.send("Hello World!"));
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
  // ✅ تهيئة الـ Socket.io وربطه بالسيرفر
  const io = initSocket(server);
