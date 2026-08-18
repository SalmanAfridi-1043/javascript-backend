import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { createRecurringTransaction } from "../controllers/recurring.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", createRecurringTransaction);

export default router;
