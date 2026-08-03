import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Note } from "../models/Note.model.js";

const createNoteService = async (noteData, userId) => {
  const { title, content } = noteData;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const note = await Note.create({
    title: title.trim(),
    content: content.trim(),
    owner: userId,
  });

  if (!note) {
    throw new ApiError(500, "Server failed while creating note");
  }

  return note;
};

const getAllNotesService = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // find -- measn find all with id, so it returns array of notes objects
  const allNotes = await Note.find({
    owner: userId,
    idDeleted: false,
  });

  return allNotes;
};

const getNoteByIdService = async (noteId, userId) => {
  if (!noteId) {
    throw new ApiError(400, "Note id is required");
  }
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const note = await Note.findOne({
    _id: noteId,
    owner: userId,
    idDeleted: false,
  });

  if (!note) {
    throw new ApiError(404, "Note doesnot exist");
  }

  return note;
};

export { createNoteService, getAllNotesService, getNoteByIdService };
