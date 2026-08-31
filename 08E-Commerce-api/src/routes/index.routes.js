import { Router } from "express";
import authRoute from "../modules/auth/routes/auth.routes.js";
import userRoute from "../modules/users/routes/user.routes.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);

export default router;

// Instead of registering every module directly inside app.js, we'll create an central routes file .
// This will eventually become the single place where all API modules are mounted
