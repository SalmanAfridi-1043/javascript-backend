import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";
import {
  addToCartService,
  clearCartService,
  getCartService,
  getCartSummaryService,
  removeCartItemService,
  updateCartItemService,
} from "../service/cart.service.js";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const cartData = req.body;

  const cart = await addToCartService(userId, cartData);

  return res
    .status(201)
    .json(new ApiResponse(201, cart, "Product added to cart successfully"));
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const userCart = await getCartService(userId);

  return res
    .status(201)
    .json(new ApiResponse(201, userCart, "User cart fetched successfully"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { itemId } = req.query;
  const { itemQuantity } = req.body;

  const updatedCart = await updateCartItemService(userId, itemId, itemQuantity);

  return res
    .status(201)
    .json(new ApiResponse(201, updatedCart, "Card updated successfully"));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { itemId } = req.query;

  const updatedCart = await removeCartItemService(userId, itemId);

  return res
    .status(201)
    .json(new ApiResponse(201, updatedCart, "Cart item removed successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const response = await clearCartService(userId);

  return res
    .status(201)
    .json(new ApiResponse(201, response, "Cart cleared successfully"));
});

const getCartSummary = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const cartSummary = await getCartSummaryService(userId);

  return res
    .status(201)
    .json(
      new ApiResponse(201, cartSummary, "Cart summary created successfully"),
    );
});

export {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};
