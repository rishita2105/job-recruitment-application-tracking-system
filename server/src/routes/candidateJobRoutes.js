import { Router } from "express";

import {
  applyForJob,
  getJobActionStatus,
  getMyApplications,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "../controllers/candidateJobController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("candidate"));

router.get("/saved", getSavedJobs);

router.get(
  "/applications",
  getMyApplications,
);

router.get(
  "/:jobId/status",
  getJobActionStatus,
);

router.post("/:jobId/save", saveJob);

router.delete("/:jobId/save", unsaveJob);

router.post("/:jobId/apply", applyForJob);

export default router;