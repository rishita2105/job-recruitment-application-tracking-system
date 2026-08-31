import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import candidateProfileRoutes from "./routes/CandidateProfileRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

const app = express();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const uploadsDirectory = path.resolve(
  dirname,
  "../uploads",
);

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
  function allowCrossOriginImages(
    request,
    response,
    next,
  ) {
    response.setHeader(
      "Cross-Origin-Resource-Policy",
      "cross-origin",
    );

    next();
  },

  express.static(uploadsDirectory),
);

app.use(
  "/api/candidate/profile",
  candidateProfileRoutes,
);

app.use(
  "/api/recruiter/company",
  companyRoutes,
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
      message: "The uploaded file is too large",
    });
  }

  response.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export default app;
