import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Post } from "../models/post.model.js";
import { slugify } from "../utils/slugify.js";
import { Like } from "../models/like.model.js";

const createPostService = async (authorId, data) => {
  const { title, content, category, status, tags, coverImage } = data;

  validateRequired(title, "Title");
  validateRequired(content, "Content");
  validateRequired(category, "Category");
  validateRequired(authorId, "Author id");

  const slug = slugify(title);

  const existingPost = await Post.findOne({ slug });

  if (existingPost) {
    throw new ApiError(409, "A post with this title already exists");
  }

  const post = await Post.create({
    title,
    content,
    slug,
    author: authorId,
    coverImage,
    category,
    tags,
    status,
  });

  return post;
};

const getSinglePostService = async (slug) => {
  const normalizedSlug = slug?.trim().toLowerCase();
  validateRequired(normalizedSlug, "Slug");

  const post = await Post.findOne({ slug: normalizedSlug }).populate(
    "author",
    "-password -refreshToken",
  );

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  return post;
};

const updatePostService = async (authorId, slug, data) => {
  const { title, content, category, tags, status, coverImage } = data;

  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(normalizedSlug, "Slug");
  validateRequired(authorId, "Author id");

  const post = await Post.findOne({ slug: normalizedSlug });

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  // authorization check
  if (!post.author.equals(authorId)) {
    throw new ApiError(403, "Unauthorized access");
  }

  // if title has changed, then slug must be changed
  // if title is valid and post title != current title
  if (title !== undefined && title.trim() !== post.title) {
    const newSlug = slugify(title);

    // checking existing post with slug
    const existingPost = await Post.findOne({
      slug: newSlug,
      _id: { $ne: post._id },
    });

    if (existingPost) {
      throw new ApiError(409, "A post with this title already exists");
    }

    post.slug = newSlug;
    post.title = title.trim();
  }

  if (content !== undefined) {
    if (!content.trim()) {
      throw new ApiError(400, "Content cannot be empty");
    }
    post.content = content.trim();
  }

  if (category !== undefined) {
    if (!category.trim()) {
      throw new ApiError(400, "Category cannot be empty");
    }
    post.category = category.trim();
  }

  if (tags !== undefined) {
    post.tags = tags;
  }

  if (status !== undefined) {
    if (!["draft", "published"].includes(status)) {
      throw new ApiError(400, "Invalid post status");
    }
    post.status = status;
  }

  if (coverImage !== undefined) {
    post.coverImage = coverImage;
  }

  await post.save();

  return post;
};

const deletePostService = async (authorId, slug) => {
  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(authorId, "Author id");
  validateRequired(normalizedSlug, "Slug");

  const post = await Post.findOneAndDelete({
    slug: normalizedSlug,
    author: authorId,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return { success: true };
};

const getAllPostsService = async (status) => {
  // get all public posts who's status is published

  const posts = await Post.find({
    status: "published",
  })
    .populate("author", "-password -refreshToken")
    .sort({ createdAt: -1 });

  if (posts.length === 0) {
    throw new ApiError(404, "No post found");
  }

  return posts;
};

const searchPostService = async (searchNode) => {
  validateRequired(searchNode, "Search value");

  // case insensitive regex
  const searchRegex = new RegExp(searchNode, "i");

  const posts = await Post.find({
    status: "published",
    $or: [
      {
        title: searchRegex,
      },
      {
        content: searchRegex,
      },
    ],
  })
    .populate("author", "-password -refreshToken")
    .sort({ createdAt: -1 });

  if (posts.length === 0) {
    throw new ApiError(404, "Posts not found");
  }

  return posts;
};

const incrementPostViewsService = async (slug) => {
  // public posts views updating opening

  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(normalizedSlug, "Slug");

  const post = await Post.findOneAndUpdate(
    {
      slug: normalizedSlug,
    },
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    },
  );

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  return post;
};

const getPostsbyCategoryService = async (category) => {
  // search public posts based on category

  const normalizedCategory = category?.trim().toLowerCase();

  validateRequired(normalizedCategory, "Category");

  const posts = await Post.find({
    status: "published",
    category: normalizedCategory,
  })
    .populate("author", "-password -refreshToken")
    .sort({ createdAt: -1 });

  if (posts.length === 0) {
    throw new ApiError(404, "No posts found");
  }

  return posts;
};

const likeAPostService = async (userId, slug) => {
  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(userId, "Author id");
  validateRequired(normalizedSlug, "Slug value");

  const post = await Post.findOne({
    slug: normalizedSlug,
    status: "published",
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await Like.findOne({
    user: userId,
    post: post._id,
  });

  if (existingLike) {
    throw new ApiError(409, "Post already liked by user");
  }

  const like = await Like.create({
    user: userId,
    post: post._id,
  });

  if (!like) {
    throw new ApiError(500, "Server failed while creating like");
  }

  return {
    user: like.user,
    success: true,
  };
};

const unlikeAPostService = async (userId, slug) => {
  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(userId, "User id");
  validateRequired(normalizedSlug, "Slug value");

  const post = await Post.findOne({
    slug: normalizedSlug,
    status: "published",
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const like = await Like.findOneAndDelete({
    user: userId,
    post: post._id,
  });

  if (!like) {
    throw new ApiError(404, "Like not found");
  }

  return {
    success: true,
  };
};

export {
  createPostService,
  getSinglePostService,
  updatePostService,
  deletePostService,
  getAllPostsService,
  searchPostService,
  incrementPostViewsService,
  getPostsbyCategoryService,
  likeAPostService,
  unlikeAPostService,
};
