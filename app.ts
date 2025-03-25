import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import responseTime from "response-time";

import { MongoDbConnection } from "./config/MongoDbConnection";
import { router } from "./routes/UserRoutes";
import { LimitRouter } from "./routes/LimitRoutes";

dotenv.config();
const app = express();
const port = process.env.RDS_HOSTNAME || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Response Time Logger
app.use(
  responseTime((req: Request, res: Response, time: number) => {
    console.log(`Request to ${req.method} ${req.url} took ${time.toFixed(2)}ms`);
  })
);

// CORS Configuration
const allowOrigin = [
  "chrome-extension://fmjgimepnoffjjongiedkgbanfnhobkk",
  "https://code-analyzer-login-auth.vercel.app",
  "*",
];

app.use(
  cors({
    origin: allowOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/user", router);
app.use("/bot", LimitRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Start Server
const start = async () => {
  try {
    await MongoDbConnection(process.env.RDS_MONGODB_URI!);
    console.log("DB connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
  }
};

start();
