import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  changePassword,
  deleteUserProfile,
  getUserOrder,
  getUserOrders,
  getUserProfile,
  setDefaultAddress,
  updateUserProfile,
} from "../controller/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);

router.patch("/profile", upload.single("avatar"), updateUserProfile);

router.patch("/change-password", changePassword);

router.delete("/profile", deleteUserProfile);

router.get("/orders", getUserOrders);

router.get("/orders/:orderId", getUserOrder);

router.patch("/addresses/:addressId/default", setDefaultAddress);

export default router;
