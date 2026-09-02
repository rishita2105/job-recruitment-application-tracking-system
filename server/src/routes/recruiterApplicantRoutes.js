import { Router } from "express";

import {
  getAllRecruiterApplications,
  getJobApplications,
  getRecruiterApplication,
  updateApplicationStatus,
} from "../controllers/recruiterApplicantController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("recruiter"));

router.get(
  "/applications",
  getAllRecruiterApplications,
);

router.get(
  "/jobs/:jobId/applications",
  getJobApplications,
);

router.get(
  "/applications/:applicationId",
  getRecruiterApplication,
);

router.patch(
  "/applications/:applicationId/status",
  updateApplicationStatus,
);

export default router;