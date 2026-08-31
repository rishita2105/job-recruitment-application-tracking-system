import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "node:path";
import candidateProfileRoutes from "./routes/CandidateProfileRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads")),
);

app.use(
  "/api/candidate/profile",
  candidateProfileRoutes,
);

app.get("/", (request, response) => {
  response.json({
    success: true,
    message: "Welcome to the Job Recruitment API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  if (error.code === 11000) {
    return response.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    return response.status(400).json({
      success: false,
      message,
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(400).json({
      success: false,
      message: "Resume cannot exceed 5 MB",
    });
  }

  response.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export default app;
