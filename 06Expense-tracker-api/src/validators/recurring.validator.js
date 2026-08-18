import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const validateRecurringData = (data) => {
  const {
    type,
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    recurring,
    frequency,
    notes,
  } = data;

  const normalizedType = type?.trim().toLowerCase();
  const normalizedDescription = description?.trim();
  const normalizedPaymentMethod = paymentMethod?.trim().toLowerCase();
  const normalizedNotes = notes?.trim();
  const normalizedFrequency = frequency?.trim().toLowerCase();

  validateRequired(normalizedType, "Type");

  if (!["income", "expense"].includes(normalizedType)) {
    throw new ApiError(400, "Invalid type");
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Enter a valid positive amount");
  }

  validateRequired(normalizedDescription, "Description");

  validateObjectId(categoryId, "Category");

  validateRequired(normalizedPaymentMethod, "Payment method");

  if (!["cash", "bank", "card", "wallet"].includes(normalizedPaymentMethod)) {
    throw new ApiError(
      400,
      "Payment method must be cash, bank, card, or wallet",
    );
  }

  validateRequired(date, "Date");

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, "Enter a valid date");
  }

  validateRequired(recurring, "Recurring");

  if (typeof recurring !== "boolean") {
    throw new ApiError(400, "Recurring must be a boolean");
  }

  if (recurring !== true) {
    throw new ApiError(400, "Recurring must be true");
  }

  validateRequired(normalizedFrequency, "Frequency");

  if (!["daily", "weekly", "monthly", "yearly"].includes(normalizedFrequency)) {
    throw new ApiError(
      400,
      "Frequency must be daily, weekly, monthly, or yearly",
    );
  }

  return {
    type: normalizedType,
    amount,
    description: normalizedDescription,
    categoryId,
    paymentMethod: normalizedPaymentMethod,
    date: parsedDate,
    recurring,
    frequency: normalizedFrequency,
    notes: normalizedNotes,
  };
};

const validateRecurringFilters = (recurringFilters) => {
  const { type, frequency } = recurringFilters;

  const normalizedType = type?.trim().toLowerCase();
  const normalizedFrequency = frequency?.trim().toLowerCase();

  if (normalizedType !== undefined) {
    if (!["income", "expense"].includes(normalizedType)) {
      throw new ApiError(400, "Type can be income or expense");
    }
  }

  if (normalizedFrequency !== undefined) {
    if (
      !["daily", "weekly", "monthly", "yearly"].includes(normalizedFrequency)
    ) {
      throw new ApiError(
        400,
        "Frequency must be daily, weekly, monthly, or yearly",
      );
    }
  }

  return {
    type: normalizedType,
    frequency: normalizedFrequency,
  };
};

export { validateRecurringData, validateRecurringFilters };
