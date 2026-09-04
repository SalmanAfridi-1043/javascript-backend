import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";

const validateOrderInputAddress = (shippingAddress) => {
  const { fullName, phone, addressLine, city, postalCode, country } =
    shippingAddress;

  const normalizedFullName = fullName?.trim();
  const normalizedPhone = phone?.trim();
  const normalizedAddressLine = addressLine?.trim();
  const normalizedCity = city?.trim();
  const normalizedPostalCode =
    postalCode !== undefined ? postalCode?.trim() : undefined;
  const normalizedCountry = country?.trim();

  validateRequired(normalizedFullName, "Full Name is required");
  validateRequired(normalizedPhone, "Phone number is required");
  validateRequired(normalizedAddressLine, "Address line is required");
  validateRequired(normalizedCity, "City is required");
  validateRequired(normalizedCountry, "Country is required");

  return {
    fullName: normalizedFullName,
    phone: normalizedPhone,
    addressLine: normalizedAddressLine,
    city: normalizedCity,
    postalCode: normalizedPostalCode,
    country: normalizedCountry,
  };
};

const validateOrderParams = (queryParams) => {
  const { page, limit } = queryParams;

  const normalizedPage = page !== undefined ? Number(page) : 1;
  const normalizedLimit = limit !== undefined ? Number(limit) : 10;

  if (normalizedPage !== undefined) {
    if (
      !Number.isFinite(normalizedPage) ||
      !Number.isInteger(normalizedPage) ||
      normalizedPage < 1
    ) {
      throw new ApiError(400, "Enter positive finite page value");
    }
  }

  if (normalizedLimit !== undefined) {
    if (
      !Number.isFinite(normalizedLimit) ||
      !Number.isInteger(normalizedLimit) ||
      normalizedLimit < 1
    ) {
      throw new ApiError(400, "Enter positive finite limit value");
    }
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

const validateOrderStatus = (status) => {
  const normalizedStatus = status?.trim().toUpperCase();

  validateRequired(normalizedStatus, "Status");

  if (
    ![
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
    ].includes(normalizedStatus)
  ) {
    throw new ApiError(400, "Enter a valid order status");
  }

  return {
    orderStatus: normalizedStatus,
  };
};

const validateOrderReturnData = (returnData) => {
  const { status, note } = returnData;

  const normalizedStatus = status.trim().toUpperCase();
  const normalizedNote = note !== undefined ? note.trim() : undefined;

  validateRequired(normalizedStatus, "Status");

  if (!["APPROVED", "REJECTED"].includes(normalizedStatus)) {
    throw new ApiError(
      400,
      "Invalid status!. Only APPROVED or REJECTED is allowed",
    );
  }

  return {
    status: normalizedStatus,
    note: normalizedNote,
  };
};

export {
  validateOrderInputAddress,
  validateOrderParams,
  validateOrderStatus,
  validateOrderReturnData,
};
