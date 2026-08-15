import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createBudget,
  getAllBudgets,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createBudget);
router.get("/", getAllBudgets);

export default router;
