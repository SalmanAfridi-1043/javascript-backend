import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getAllRecurringTransactions,
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

export default router;
