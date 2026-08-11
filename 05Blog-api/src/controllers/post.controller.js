import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getSinglePostService,
  searchPostService,
  updatePostService,
} from "../services/post.service.js";

const createPost = asyncHandler(async (req, res, next) => {
  const authorId = req.user?._id; // for posts, slug is unique id
  const data = req.body;

  let coverImagePath;
  if (req.file) {
    coverImagePath = req.file.path;

    const cloudinaryUrl = await uploadOnCloudinary(
      coverImagePath,
      "Blog-API/image",
    );

    coverImagePath = cloudinaryUrl.secure_url;
  }

  const createdPost = await createPostService(authorId, {
    ...data,
    ...(coverImagePath && { coverImage: coverImagePath }),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, createdPost, "Post created successfully"));
});

const getSinglePost = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const post = await getSinglePostService(slug);

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));
});

const updatePost = asyncHandler(async (req, res, next) => {
  const authorId = req.user?._id;
  const slug = req.params?.slug; // slug - unique id for post
  const data = req.body;

  let coverImagePath;
  if (req.file) {
    coverImagePath = req.file?.path;
    const cloudinaryUrl = await uploadOnCloudinary(
      coverImagePath,
      "Blog-API/image",
    );

    coverImagePath = cloudinaryUrl.secure_url;
  }

  const updatedPost = await updatePostService(authorId, slug, {
    ...data,
    ...(coverImagePath && { coverImage: coverImagePath }),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res, next) => {
  const authorId = req.user?._id;
  const slug = req.params?.slug; // slug - unique id for post

  const response = await deletePostService(authorId, slug);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Post deleted successfully"));
});

const getAllPosts = asyncHandler(async (req, res, next) => {
  // get all posts whos status is published

  const allPosts = await getAllPostsService();

  return res
    .status(200)
    .json(new ApiResponse(200, allPosts, "All posts fetched successfully"));
});

const searchPost = asyncHandler(async (req, res, next) => {
  // searchNode is a value used to search post based on title or content
  // like searchNode = "backend" - so we ll check both title and content for backend
  const { searchNode } = req.query;

  const posts = await searchPostService(searchNode);

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Searched posts fetched successfully"));
});

export {
  createPost,
  getSinglePost,
  updatePost,
  deletePost,
  getAllPosts,
  searchPost,
};
