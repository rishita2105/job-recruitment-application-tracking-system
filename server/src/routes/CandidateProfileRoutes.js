import { Router } from "express";

import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
} from "../controllers/CandidateProfileController.js";

import { authenticate } from "../middleware/authenticate.js";

import { authorizeRoles } from "../middleware/authorizeRoles.js";

import uploadResume from "../middleware/uploadResume.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("candidate"));

router.get("/", getCandidateProfile);

router.put("/", updateCandidateProfile);

router.post(
  "/resume",
  uploadResume.single("resume"),
  uploadCandidateResume,
);

export default router;