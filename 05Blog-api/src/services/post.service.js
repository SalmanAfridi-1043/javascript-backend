import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Post } from "../models/post.model.js";
import { slugify } from "../utils/slugify.js";

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

export {
  createPostService,
  getSinglePostService,
  updatePostService,
  deletePostService,
  getAllPostsService,
  searchPostService,
};
