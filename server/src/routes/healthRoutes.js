import { Router } from "express";

const router = Router();

router.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    message: "Job Recruitment API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;

