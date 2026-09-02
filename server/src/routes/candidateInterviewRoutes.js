import { Router } from "express";

import { getCandidateInterviews } from "../controllers/interviewController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("candidate"));

router.get("/", getCandidateInterviews);

export default router;