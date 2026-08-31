import { Router } from "express";

import {
  getMyCompany,
  saveMyCompany,
  uploadMyCompanyLogo,
} from "../controllers/companyController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

import uploadCompanyLogo from "../middleware/uploadCompanyLogo.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("recruiter"));

router.get("/", getMyCompany);

router.put("/", saveMyCompany);

router.post(
  "/logo",
  uploadCompanyLogo.single("logo"),
  uploadMyCompanyLogo,
);

export default router;