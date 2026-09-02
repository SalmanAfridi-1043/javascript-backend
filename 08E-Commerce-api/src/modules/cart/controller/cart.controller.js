import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";
import { addToCartService } from "../service/cart.service.js";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const cartData = req.body;

  const cart = await addToCartService(userId, cartData);

  return res
    .status(201)
    .json(new ApiResponse(201, cart, "Product added to cart successfully"));
});

export { addToCart };
