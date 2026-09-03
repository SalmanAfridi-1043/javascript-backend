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

export { validateOrderInputAddress };
