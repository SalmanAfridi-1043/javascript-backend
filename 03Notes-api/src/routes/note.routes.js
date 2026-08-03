import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";

import { createNote, getAllNotes } from "../controllers/note.controller.js";

const router = Router();

router.post("/create-note", authMiddleware, createNote);
router.get("/notes", authMiddleware, getAllNotes);
