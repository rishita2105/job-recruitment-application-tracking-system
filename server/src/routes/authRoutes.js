import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getMe, login, logout, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
