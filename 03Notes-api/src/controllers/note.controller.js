import { ApiError, ApiResponse } from "../utils/ApiError.js";
import {
  createNoteService,
  getAllNotesService,
  getNoteByIdService,
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

    const notes = await getAllNotesService(userId);

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

export { createNote };
