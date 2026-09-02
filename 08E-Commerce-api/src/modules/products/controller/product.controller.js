import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import { createProductService } from "../service/product.service.js";

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

export { createProduct };
