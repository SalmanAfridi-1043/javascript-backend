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

const createNote = async (req, res, next) => {
  try {
    const noteData = req.body;
    const userId = req.user?._id;

    const createdNote = await createNoteService(noteData, userId);

    return res
      .status(201)
      .json(new ApiResponse(201, createdNote, "Note created successfully"));
  } catch (error) {
    console.log("createNode Error: ", error);
    next(error);
  }
};

const getAllNotes = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { page, limit, sortBy, order } = req.query;

    const notes = await getAllNotesService(userId, page, limit, sortBy, order);

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "All notes fetched successfully"));
  } catch (error) {
    console.log("getAllNotes error: ", error);
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?._id;

    const note = await getNoteByIdService(noteId, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, note, "Note fetched successfully"));
  } catch (error) {
    console.log("getNoteById error: ", error);
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const updateData = req.body;
    const { noteId } = req.params;
    const userId = req.user?._id;

    const updatedNote = await updateNoteService(updateData, noteId, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
  } catch (error) {
    console.log("updateNote error: ", error);
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?._id;

    const response = await deleteNoteService(noteId, userId);

    return res.status(200).json(new ApiResponse(200, {}, response.message));
  } catch (error) {
    console.log("deleteNote error: ", error);
    next(error);
  }
};

const favoriteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?._id;

    const response = await favoriteNoteService(noteId, userId);

    return res.status(200).json(new ApiResponse(200, {}, response.message));
  } catch (error) {
    console.log("favourateNote error: ", error.message);
    next(error);
  }
};

const archiveNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?._id;

    const response = await archiveNoteService(noteId, userId);

    return res.status(200).json(new ApiResponse(200, {}, response.message));
  } catch (error) {
    console.log("archiveNote error: ", error.message);
    next(error);
  }
};

const searchNotes = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const search = req.query.search;

    const notes = await searchNotesService(userId, search);

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Searched notes fetched successfylly"));
  } catch (error) {
    console.log("searchNotes error: ", error.message);
    next(error);
  }
};

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
