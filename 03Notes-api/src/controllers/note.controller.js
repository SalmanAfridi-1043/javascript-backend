import { ApiError, ApiResponse } from "../utils/ApiError.js";
import {
  archiveNoteService,
  createNoteService,
  deleteNoteService,
  favoriteNoteService,
  getAllNotesService,
  getNoteByIdService,
  searchNotesService,
  updateNoteService,
} from "../services/note.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createNote = asyncHandler(async (req, res, next) => {
  const noteData = req.body;
  const userId = req.user?._id;

  const createdNote = await createNoteService(noteData, userId);

  return res
    .status(201)
    .json(new ApiResponse(201, createdNote, "Note created successfully"));
});

const getAllNotes = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const notes = await getAllNotesService(userId, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "All notes fetched successfully"));
});

const getNoteById = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user?._id;

  const note = await getNoteByIdService(noteId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res, next) => {
  const updateData = req.body;
  const { noteId } = req.params;
  const userId = req.user?._id;

  const updatedNote = await updateNoteService(updateData, noteId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user?._id;

  const response = await deleteNoteService(noteId, userId);

  return res.status(200).json(new ApiResponse(200, {}, response.message));
});

const favoriteNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user?._id;

  const response = await favoriteNoteService(noteId, userId);

  return res.status(200).json(new ApiResponse(200, {}, response.message));
});

const archiveNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user?._id;

  const response = await archiveNoteService(noteId, userId);

  return res.status(200).json(new ApiResponse(200, {}, response.message));
});

const searchNotes = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const search = req.query.search;

  const notes = await searchNotesService(userId, search);

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Searched notes fetched successfylly"));
});

export {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  favoriteNote,
  archiveNote,
  searchNotes,
};
