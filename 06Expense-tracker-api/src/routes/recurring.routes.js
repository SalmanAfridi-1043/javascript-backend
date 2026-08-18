import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createRecurringTransaction,
  getAllRecurringTransactions,
} from "../controllers/recurring.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", createRecurringTransaction);

router.get("/", getAllRecurringTransactions);

export default router;
