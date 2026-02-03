import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import studentRouter from "./routes/studentRouter.js";
import facultyRouter from "./routes/facultyRouter.js";
import attendanceRouter from "./routes/attendanceRouter.js";
import eventRouter from "./routes/eventRouter.js";
import notesRouter from "./routes/notesRouter.js";

const app = express();

/* ---------- Middlewares ---------- */

// Normalize path: fix double slashes (e.g. //api -> /api) so CORS preflight isn't redirected
app.use((req, res, next) => {
  if (req.url.startsWith("//")) {
    req.url = req.url.replace(/\/+/g, "/");
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// CORS: allow frontend origin and credentials (cookies)
const allowedOrigins = [
  "https://ums-client.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------- Database Connection Middleware ---------- */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/* ---------- Routes ---------- */

app.get("/", (req, res) => {
  res.status(200).json({ message: "API Working 🚀" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/students", studentRouter);
app.use("/api/facultys", facultyRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/events", eventRouter);
app.use("/api/notes", notesRouter);

/* ---------- Error Handler ---------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ---------- Local Development Only ---------- */

const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

/* ---------- Vercel: export Express app (Vercel runs it as a serverless function) ---------- */

export default app;
