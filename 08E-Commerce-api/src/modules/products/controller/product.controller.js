import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import {
  createProductService,
  createProductVariantService,
  deleteProductService,
  deleteProductVariantService,
  getAllProductsService,
  getProductByIdService,
  getProductVariantByIdService,
  getProductVariantsService,
  updateProductService,
  updateProductStatusService,
  updateProductVariantService,
  updateVariantStockService,
} from "../service/product.service.js";

const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };

  // below is array of images object
  const productImagesPaths = req.files;

  if (productImagesPaths !== undefined && productImagesPaths.length !== 0) {
    // promise.all() - used to wait for all the images upload to cloudinary. Mainly used in loop in case if there are multiple actions where it should wait.
    // so here, we ll wait for all images to be uploaded to cloudinary.
    const productImages = await Promise.all(
      productImagesPaths.map(async (imagePath) => {
        const cloudinaryUrl = await uploadOnCloudinary(
          imagePath.path,
          "E-Commerce-API/product",
        );

        return cloudinaryUrl?.secure_url;
      }),
    );

    productData.productImages = productImages;
  }

  const createdProduct = await createProductService(productData);

  return res
    .status(201)
    .json(new ApiResponse(201, createdProduct, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const queryParams = req.query;

  const allProducts = await getAllProductsService(queryParams);

  return res
    .status(200)
    .json(new ApiResponse(200, allProducts, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await getProductByIdService(productId);

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Products fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const productUpdateData = { ...req.body };

  // below is array of images object
  const productImagesPaths = req.files;

  if (productImagesPaths !== undefined && productImagesPaths.length !== 0) {
    // promise.all() - used to wait for all the images upload to cloudinary. Mainly used in loop in case if there are multiple actions where it should wait.
    // so here, we ll wait for all images to be uploaded to cloudinary.
    const productImages = await Promise.all(
      productImagesPaths.map(async (imagePath) => {
        const cloudinaryUrl = await uploadOnCloudinary(
          imagePath.path,
          "E-Commerce-API/product",
        );

        return cloudinaryUrl?.secure_url;
      }),
    );

    productUpdateData.productImages = productImages;
  }

  const updatedProduct = await updateProductService(
    productId,
    productUpdateData,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const response = await deleteProductService(productId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Product deleted successfully"));
});

const updateProductStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { status } = req.body;

  const updatedProductStatus = await updateProductStatusService(
    productId,
    status,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProductStatus,
        "Product status updated successfully",
      ),
    );
});

const createProductVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const variantData = req.body;

  const createdVariant = await createProductVariantService(
    productId,
    variantData,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdVariant,
        "Product variant created successfully",
      ),
    );
});

const getProductVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const productVariants = await getProductVariantsService(productId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        productVariants,
        "Product variants fetched successfully",
      ),
    );
});

const getProductVariantById = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const productVariant = await getProductVariantByIdService(
    productId,
    variantId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        productVariant,
        "Product variant fetched successfully",
      ),
    );
});

const updateProductVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const variantUpdateData = req.body;

  const updatedVariant = await updateProductVariantService(
    productId,
    variantId,
    variantUpdateData,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVariant,
        "Product variant updated successfully",
      ),
    );
});

const deleteProductVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const response = await deleteProductVariantService(productId, variantId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Product variant deleted successfully"),
    );
});

const updateVariantStock = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const { stock } = req.body;

  const updatedStock = await updateVariantStockService(
    productId,
    variantId,
    stock,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedStock, "Variant stock updated successfully"),
    );
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  createProductVariant,
  getProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
  updateVariantStock,
};
