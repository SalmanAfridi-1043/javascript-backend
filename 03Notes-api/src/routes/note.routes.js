import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";

import {
  archiveNote,
  createNote,
  deleteNote,
  favoriteNote,
  getAllNotes,
  getNoteById,
  searchNotes,
  updateNote,
} from "../controllers/note.controller.js";

const router = Router();

// as all note routes are protected and need authenticated user so we ll make it more simpler by first verify user identity before moving to any route
router.use(authMiddleware);

router.post("/notes", createNote);

router.get("/notes", getAllNotes);

router.get("/notes/search-notes", searchNotes);

router.get("/notes/:noteId", getNoteById);

router.patch("/notes/:noteId", updateNote);

router.delete("/notes/:noteId", deleteNote);

router.patch("/notes/:noteId/favorite", favoriteNote);

router.patch("/notes/:noteId/archive", archiveNote);

export default router;
