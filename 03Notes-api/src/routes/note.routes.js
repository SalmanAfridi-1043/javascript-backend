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

router.post("/notes", authMiddleware, createNote);

router.get("/notes", authMiddleware, getAllNotes);

router.get("/notes/search-notes", authMiddleware, searchNotes);

router.get("/notes/:noteId", authMiddleware, getNoteById);

router.patch("/notes/:noteId", authMiddleware, updateNote);

router.delete("/notes/:noteId", authMiddleware, deleteNote);

router.patch("/notes/:noteId/favorite", authMiddleware, favoriteNote);

router.patch("/notes/:noteId/archive", authMiddleware, archiveNote);

export default router;
