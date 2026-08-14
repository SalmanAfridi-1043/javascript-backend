import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";

const validateTransactionData = (data) => {
  const {
    type,
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    notes,
    recurring = false,
    frequency,
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

  if (typeof recurring !== "boolean") {
    throw new ApiError(400, "Recurring must be a boolean");
  }

  if (recurring) {
    validateRequired(normalizedFrequency, "Frequency");

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
    amount,
    description: normalizedDescription,
    categoryId,
    paymentMethod: normalizedPaymentMethod,
    date: parsedDate,
    notes: normalizedNotes,
    recurring,
    frequency: recurring ? normalizedFrequency : undefined,
  };
};

const validateTransactionUpdateData = (data) => {
  const {
    type,
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    notes,
    recurring,
    frequency,
  } = data;

  const updateData = {};

  // type
  if (type !== undefined) {
    const normalizedType = type.trim().toLowerCase();

    if (!["income", "expense"].includes(normalizedType)) {
      throw new ApiError(400, "Invalid type");
    }

    updateData.type = normalizedType;
  }

  // amount
  if (amount !== undefined) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw new ApiError(400, "Enter a valid positive amount");
    }

    updateData.amount = amount;
  }

  // description
  if (description !== undefined) {
    const normalizedDescription = description.trim();

    if (!normalizedDescription) {
      throw new ApiError(400, "Description cannot be empty");
    }

    updateData.description = normalizedDescription;
  }

  // category
  if (categoryId !== undefined) {
    updateData.categoryId = categoryId;
  }

  // payment method
  if (paymentMethod !== undefined) {
    const normalizedPaymentMethod = paymentMethod.trim().toLowerCase();

    if (!["cash", "bank", "card", "wallet"].includes(normalizedPaymentMethod)) {
      throw new ApiError(
        400,
        "Payment method must be cash, bank, card, or wallet",
      );
    }

    updateData.paymentMethod = normalizedPaymentMethod;
  }

  // date
  if (date !== undefined) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Enter a valid date");
    }

    updateData.date = parsedDate;
  }

  // notes
  if (notes !== undefined) {
    updateData.notes = notes.trim();
  }

  // recurring
  if (recurring !== undefined) {
    if (typeof recurring !== "boolean") {
      throw new ApiError(400, "Recurring must be a boolean");
    }

    updateData.recurring = recurring;
  }

  // frequency
  if (frequency !== undefined) {
    const normalizedFrequency = frequency.trim().toLowerCase();

    if (
      !["daily", "weekly", "monthly", "yearly"].includes(normalizedFrequency)
    ) {
      throw new ApiError(
        400,
        "Frequency must be daily, weekly, monthly, or yearly",
      );
    }

    updateData.frequency = normalizedFrequency;
  }

  // At least one field must be provided
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No update data provided");
  }

  return updateData;
};
export { validateTransactionData, validateTransactionUpdateData };
