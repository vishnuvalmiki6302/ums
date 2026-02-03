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

  app.use(express.json());
  app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
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
