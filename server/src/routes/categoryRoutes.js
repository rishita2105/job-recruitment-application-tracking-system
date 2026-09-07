import express from "express";

import { getActiveCategories } from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getActiveCategories);

export default router;
