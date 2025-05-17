import cors from "cors";
import { graphqlHTTP } from "express-graphql"; // ✅ تأكد من الاستدعاء الصحيح
import path from "node:path";
import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./utils/error/error.js";
import helmet from "helmet";
import authController from "../src/moduls/auth/auth.controller.js";
import userController from "../src/moduls/user/user.controller.js";
import jobController from "../src/moduls/job/job.controller.js";
import chatController from "../src/moduls/chat/chat.controller.js";
import endPointController from "../src/moduls/endPoint/endPoint.controller.js";
import companyController from "../src/moduls/company/company.controller.js";
import schema from "../src/moduls/Dashboard/dashboard.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import playground from "graphql-playground-middleware-express";
import { verifyToken, verifyToken2 } from "./utils/security/token.js";
import { rateLimit } from 'express-rate-limit'

const bootstrap = (app, express) => {
  const limiter = rateLimit({
    limit: 100,
    windowMs: 15 * 60 * 1000,
    message: { err: "rate limit reached" },
    statusCode: 429,
    handler: (req, res, next) => {
      return next(new Error("Game Over", { cause: 404 }));
    },
    legacyHeaders: true,
    standardHeaders: "draft-8",
  });

  app.use(helmet());
  app.use(cors());
  app.use(limiter);

  // app.use("/auth", limiter);

  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  app.get("/", (req, res, next) => {
    return res.status(200).json({
      message: "Welcome in node.js project powered by express and ES6",
    });
  });
  app.use("/endPoint", endPointController);
  app.use("/chat", chatController);
  app.use("/jobs", jobController);
  app.use("/company", companyController);
  app.use("/auth", authController);
  app.use("/user", userController);
  app.get('/playground', playground.default({ endpoint: '/graphql' }));

  app.use(
    "/graphql",
    graphqlHTTP(async (req) => {
      const token = req.headers.authorization || "";
      const user = verifyToken2(token); // لازم تكون عندك دالة تفك تشفير التوكن
      console.log("User in Context:", user); // 🔹 تحقق إنه بيوصل للـ context

      return {
        schema,
        context: { user },
        graphiql: true,
      };
    })
  );

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "In-valid routing" });
  });
  //Error Hanling
  app.use(globalErrorHandling);
  // DB
  connectDB();
};

export default bootstrap;
