import { ApiError } from "../../../utils/ApiError.js";
import { Category } from "../../categories/model/category.model.js";
import { Product } from "../../products/model/product.model.js";
import { ProductVariant } from "../../products/model/productVariant.model.js";
import { Order } from "../../orders/model/order.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";

import {
  validateProductInputData,
  validateProductUpdateData,
  validateQueryParameters,
} from "../validator/product.validator.js";

import { validateVariantInputData } from "../validator/productVariant.validator.js";

const createProductService = async (productData) => {
  const { name, description, brand, categoryId, price, sku, stock } =
    validateProductInputData(productData);

  const { productImages } = productData;

  // check if category exists
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });
  validateNotFound(category, "category");

  //   SKU = Stock Keeping Unit — a unique code used internally to identify and track a specific product/variant in inventory.
  const isSkuAlreadyExists = await Product.findOne({
    sku,
  });
  if (isSkuAlreadyExists) {
    throw new ApiError(409, "Product Sku already exists");
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category: categoryId,
    price,
    sku,
    productImages, // array of product images
    stock,
  });

  return product;
};

const getAllProductsService = async (queryParams) => {
  const {
    search,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    inStock,
    status,
    sort,
    page,
    limit,
  } = validateQueryParameters(queryParams);

  const filterObject = {
    isActive: true,
  };

  if (search !== undefined) {
    filterObject.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (categoryId !== undefined) {
    const isCategoryExists = await Category.findOne({
      _id: categoryId,
      isActive: true,
    });
    validateNotFound(isCategoryExists, "Category");

    filterObject.category = categoryId;
  }

  // set price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filterObject.price = {};

    if (minPrice !== undefined) {
      filterObject.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filterObject.price.$lte = maxPrice;
    }
  }

  if (status !== undefined) {
    filterObject.status = status;
  }

  if (brand !== undefined) {
    filterObject.brand = brand;
  }

  if (inStock !== undefined) {
    filterObject.stock = inStock ? { $gt: 0 } : { $eq: 0 };
  }

  const sortingObject = {};
  if (sort === "price") sortingObject.price = 1;
  if (sort === "-price") sortingObject.price = -1;
  if (sort === "brand") sortingObject.brand = 1;
  if (sort === "-brand") sortingObject.brand = -1;

  const skip = (page - 1) * limit;

  const allProducts = await Product.find(filterObject)
    .sort(sortingObject)
    .skip(skip)
    .limit(limit);

  const totalProducts = await Product.countDocuments(filterObject);

  const pages = Math.ceil(totalProducts / limit);

  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    allProducts,
    pagination: {
      totalProducts,
      pages,
      page,
      limit,
      previousPage,
      nextPage,
    },
  };
};

const getProductByIdService = async (productId) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).populate("category");

  return product;
};

const updateProductService = async (productId, productUpdateData) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  const { name, description, brand, categoryId, price, sku, stock } =
    validateProductUpdateData(productUpdateData);

  const { productImages } = productUpdateData;

  if (categoryId !== undefined) {
    const isCategoryExists = await Category.findOne({
      _id: categoryId,
      isActive: true,
    });
    validateNotFound(isCategoryExists, "Category");
  }

  // sku = a unique code to represent product in stock
  if (sku !== undefined) {
    const isSkuExists = await Product.findOne({
      _id: { $ne: productId },
      sku,
    });
    if (isSkuExists) {
      throw new ApiError(409, "Sku alread exists");
    }
  }

  const updateObject = {};

  if (name !== undefined) {
    updateObject.name = name;
  }

  if (description !== undefined) {
    updateObject.description = description;
  }

  if (brand !== undefined) {
    updateObject.brand = brand;
  }

  if (categoryId !== undefined) {
    updateObject.category = categoryId;
  }

  if (price !== undefined) {
    updateObject.price = price;
  }

  if (sku !== undefined) {
    updateObject.sku = sku;
  }

  if (stock !== undefined) {
    updateObject.stock = stock;
  }

  if (productImages !== undefined) {
    updateObject.productImages = productImages;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: updateObject,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  validateNotFound(updatedProduct, "Product");

  return updatedProduct;
};

const deleteProductService = async (productId) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  // check if this product is used by any order actively
  const isProductUsedByOrder = await Order.findOne({
    "items.product": productId,
    orderStatus: {
      $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"],
    },
  });
  if (isProductUsedByOrder) {
    throw new ApiError(409, "Product is used by active order");
  }

  const product = await Product.findByIdAndUpdate(productId, {
    $set: { isActive: false },
  });
  validateNotFound(product, "Product");

  return { success: true };
};

const updateProductStatusService = async (productId, status) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  const normalizedStatus = status?.trim().toUpperCase();

  if (!["ACTIVE", "INACTIVE", "OUT_OF_STOCK"].includes(normalizedStatus)) {
    throw new ApiError(400, "Invalid status value");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $set: { status: normalizedStatus },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  validateNotFound(product, "Product");

  return product;
};

const createProductVariantService = async (productId, variantData) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  const { sku, attributes, price, stock } =
    validateVariantInputData(variantData);

  const isProductExists = await Product.findOne({
    _id: productId,
    isActive: true,
  });
  validateNotFound(isProductExists, "Product");

  const isSkuAlreadyExists = await ProductVariant.findOne({ sku });
  if (isSkuAlreadyExists) {
    throw new ApiError(409, "Sku already exists for product variant");
  }

  const productVariant = await ProductVariant.create({
    product: productId,
    sku,
    attributes,
    price: price ?? undefined,
    stock,
  });

  return productVariant;
};

const getProductVariantsService = async (productId) => {
  validateRequired(productId, "product id");
  validateObjectId(productId, "product");

  // check if the product exists
  const isProductExists = await Product.findOne({
    _id: productId,
    isActive: true,
  });
  validateRequired(isProductExists, "product");

  // check if the product properties/variants exists
  // get all the product properties/variants
  const productVariants = await ProductVariant.find({
    product: productId,
    isActive: true,
  });

  if (productVariants.length === 0) {
    throw new ApiError(404, "Product variant not found");
  }

  return productVariants;
};

export {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  updateProductStatusService,
  createProductVariantService,
  getProductVariantsService,
};
