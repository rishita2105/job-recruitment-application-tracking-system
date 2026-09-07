import express from "express";

import {
  getAllUsers,
  toggleUserBlock,
  getAllJobsForAdmin,
  removeJob,
  getAllCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCompanies,
  updateCompanyStatus,
} from "../controllers/adminController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:userId/block", toggleUserBlock);

router.get("/companies", getAllCompanies);
router.patch("/companies/:companyId/status", updateCompanyStatus);

router.get("/jobs", getAllJobsForAdmin);
router.delete("/jobs/:jobId", removeJob);

router.get("/categories", getAllCategoriesForAdmin);
router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

export default router;
