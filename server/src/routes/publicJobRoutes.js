import { Router } from "express";

import {
  getPublicJob,
  getPublicJobs,
} from "../controllers/publicJobController.js";

const router = Router();

router.get("/", getPublicJobs);
router.get("/:jobId", getPublicJob);

export default router;