import express from "express";

import {
  getCandidateDashboard,
  getRecruiterDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get(
  "/candidate",
  authenticate,
  authorizeRoles("candidate"),
  getCandidateDashboard
);

router.get(
  "/recruiter",
  authenticate,
  authorizeRoles("recruiter"),
  getRecruiterDashboard
);

router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  getAdminDashboard
);

export default router;