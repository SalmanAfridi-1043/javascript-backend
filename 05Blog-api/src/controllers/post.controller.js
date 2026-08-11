import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getPostsbyCategoryService,
  getSinglePostService,
  incrementPostViewsService,
  likeAPostService,
  searchPostService,
  unlikeAPostService,
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

const incrementPostViews = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const incrementedPost = await incrementPostViewsService(slug);

  return res
    .status(200)
    .json(
      new ApiResponse(200, incrementedPost, "Post views updated successfully"),
    );
});

const getPostsbyCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  const posts = await getPostsbyCategoryService(category);

  return res
    .status(200)
    .json(
      new ApiResponse(200, posts, "Posts with category fetched successfully"),
    );
});

const likeAPost = asyncHandler(async (req, res, next) => {
  // authenticated used can like a post

  const userId = req.user._id;

  const { slug } = req.params;

  const likedPost = await likeAPostService(userId, slug);

  return res
    .status(200)
    .json(new ApiResponse(200, likedPost, "Post liked successfully"));
});

const unlikeAPost = asyncHandler(async (req, res, next) => {
  // authenticated used can unlike a post

  const userId = req.user._id;

  const { slug } = req.params;

  const response = await unlikeAPostService(userId, slug);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Post unliked successfully"));
});

export {
  createPost,
  getSinglePost,
  updatePost,
  deletePost,
  getAllPosts,
  searchPost,
  incrementPostViews,
  getPostsbyCategory,
  likeAPost,
  unlikeAPost,
};
