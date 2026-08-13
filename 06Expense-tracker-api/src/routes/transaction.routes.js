import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { createTransaction } from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", authMiddleware, createTransaction);

export default router;
