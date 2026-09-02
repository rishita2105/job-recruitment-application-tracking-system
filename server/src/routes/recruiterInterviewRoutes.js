import { Router } from "express";

import {
  cancelInterview,
  completeInterview,
  getRecruiterInterview,
  getRecruiterInterviews,
  rescheduleInterview,
  scheduleInterview,
} from "../controllers/interviewController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("recruiter"));

router.post(
  "/applications/:applicationId/interview",
  scheduleInterview,
);

router.get(
  "/interviews",
  getRecruiterInterviews,
);

router.get(
  "/interviews/:interviewId",
  getRecruiterInterview,
);

router.put(
  "/interviews/:interviewId",
  rescheduleInterview,
);

router.patch(
  "/interviews/:interviewId/cancel",
  cancelInterview,
);

router.patch(
  "/interviews/:interviewId/complete",
  completeInterview,
);

export default router;