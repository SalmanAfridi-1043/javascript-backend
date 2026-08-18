import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createRecurringTransaction,
  getAllRecurringTransactions,
  getSingleRecurringTransaction,
} from "../controllers/recurring.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", createRecurringTransaction);

router.get("/", getAllRecurringTransactions);

router.get("/:transactionId", getSingleRecurringTransaction);

export default router;
