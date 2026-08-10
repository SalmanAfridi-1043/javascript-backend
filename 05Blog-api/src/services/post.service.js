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

export { createPostService, getSinglePostService };
