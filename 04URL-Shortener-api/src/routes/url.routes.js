import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createUrl,
  getUserUrls,
  redirectToOriginalUrl,
} from "../controllers/url.controller.js";

const router = Router();

router.post("/create", authMiddleware, createUrl);
// without middleware. its public and anyone can visit if the shortcode exists
router.get("/redirect", redirectToOriginalUrl);
router.get("/urls", authMiddleware, getUserUrls);

export { router };
