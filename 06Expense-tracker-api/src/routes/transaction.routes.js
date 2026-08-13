import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createTransaction,
  getAllTransactions,
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getAllTransactions);

export default router;
