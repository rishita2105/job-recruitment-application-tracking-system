import { Router } from "express";

import {
  createJob,
  getRecruiterJob,
  getRecruiterJobs,
  updateJob,
  updateJobStatus,
} from "../controllers/jobController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("recruiter"));

router.post("/", createJob);

router.get("/", getRecruiterJobs);

router.get("/:jobId", getRecruiterJob);

router.put("/:jobId", updateJob);

router.patch(
  "/:jobId/status",
  updateJobStatus,
);

export default router;