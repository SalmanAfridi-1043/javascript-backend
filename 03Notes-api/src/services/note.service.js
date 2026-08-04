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

const updateNoteService = async (updateData, noteId, userId) => {
  const { title, content } = updateData;

  if (!(title?.trim() || content?.trim())) {
    throw new ApiError(400, "Title or content is required");
  }

  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id ");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id ");
  }

  const note = await Note.findOne({
    _id: noteId,
    isDeleted: false,
    owner: userId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  title?.trim() ? (note.title = title.trim()) : note.title;
  content?.trim() ? (note.content = content.trim()) : note.content;

  await note.save();

  return {
    title: note.title,
    content: note.content,
    owner: note.owner,
  };
};

const deleteNoteService = async (noteId, userId) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const note = await Note.findOne({
    _id: noteId,
    owner: userId,
    isDeleted: false,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  note.isDeleted = true;

  await note.save();

  return { message: "Note deleted successfully" };
};

const favoriteNoteService = async (noteId, userId) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const note = await Note.findOne({
    _id: noteId,
    owner: userId,
    isDeleted: false,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // if (note.isFavorite) {
  //   note.isFavorite = false;
  //   await note.save();
  //   return { message: "Note removed from favourate successfully" };
  // } else {
  //   note.isFavorite = true;
  //   await note.save();
  //   return { message: "Note added to favourate successfully" };
  // }

  note.isFavorite = !note.isFavorite;

  await note.save();

  return note.isFavorite
    ? { message: "Note added to favourate successfully" }
    : { message: "Note removed from favourate successfully" };
};

const archiveNoteService = async (noteId, userId) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const note = await Note.findOne({
    _id: noteId,
    owner: userId,
    isDeleted: false,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  note.isArchived = !note.isArchived;

  await note.save();

  return note.isArchived
    ? { message: "Note added to archived successfully" }
    : { message: "Note removed from archived successfully" };
};

const searchNotesService = async (userId, search) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!search?.trim()) {
    throw new ApiError(400, "Search content is required");
  }

  const searchedNotes = await Note.find({
    owner: userId,
    isDeleted: false,
    $or: [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        content: {
          $regex: search,
          $options: "i",
        },
      },
    ],
  });

  return searchedNotes;
};

export {
  createNoteService,
  getAllNotesService,
  searchNotesService,
  getNoteByIdService,
  updateNoteService,
  deleteNoteService,
  favoriteNoteService,
  archiveNoteService,
};
