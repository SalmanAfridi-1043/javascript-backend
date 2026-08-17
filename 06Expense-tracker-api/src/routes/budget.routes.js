import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createBudget,
  deleteBudget,
  getAllBudgets,
  getBudgetAlerts,
  getBudgetComparison,
  getBudgetProgress,
  getBudgetStatus,
  getBudgetSummary,
  getBudgetVsActualSpending,
  getSingleBudget,
  updateBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createBudget);
router.get("/", getAllBudgets);
router.get("/:budgetId", getSingleBudget);

router.patch("/:budgetId", updateBudget);

router.delete("/:budgetId", deleteBudget);

router.get("/vs-actual", getBudgetVsActualSpending);

router.get("/progress", getBudgetProgress);

router.get("/status", getBudgetStatus);

router.get("/summary", getBudgetSummary);

router.get("/comparison", getBudgetComparison);

router.get("/alert", getBudgetAlerts);

export default router;
