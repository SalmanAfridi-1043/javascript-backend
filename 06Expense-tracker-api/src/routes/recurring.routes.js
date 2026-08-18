import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getAllRecurringTransactions,
  getNextOccurrence,
  getSingleRecurringTransaction,
  toggleRecurringTransaction,
  updateRecurringTransaction,
} from "../controllers/recurring.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", createRecurringTransaction);

router.get("/", getAllRecurringTransactions);

router.get("/:transactionId", getSingleRecurringTransaction);

router.patch("/:transactionId", updateRecurringTransaction);

router.delete("/:transactionId", deleteRecurringTransaction);

router.patch("/:transactionId/toggle", toggleRecurringTransaction);

// It returns the next date when the recurring transaction should occur.
router.get("/:transactionId/next-occurrence", getNextOccurrence);

export default router;
