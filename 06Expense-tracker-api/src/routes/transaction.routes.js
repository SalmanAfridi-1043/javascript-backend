import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getSingleTransaction,
  updateTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/:transactionId", getSingleTransaction);
router.patch("/:transactionId", updateTransaction);
router.delete("/:transactionId", deleteTransaction);

export default router;
