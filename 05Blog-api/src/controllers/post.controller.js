import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { createPostService } from "../services/post.service.js";

const createPost = asyncHandler(async (req, res, next) => {
  const authorId = req.user?._id;
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

export { createPost };
