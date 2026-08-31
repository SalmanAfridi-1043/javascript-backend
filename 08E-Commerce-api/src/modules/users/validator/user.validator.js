import { ApiError } from "../../../utils/ApiError.js";

const validateUpdateData = (updateData) => {
  const { fullName, username, email } = updateData;

  const normalizedFullName = fullName?.trim();
  const normalizedUsername = username?.trim().toLowerCase();
  const normalizedEmail = email?.trim().toLowerCase();

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (normalizedFullName) {
    if (normalizedFullName.length < 5 || normalizedFullName.length > 30) {
      throw new ApiError(
        400,
        "Full name charactors should be in between 5 to 30",
      );
    }
  }

  if (normalizedUsername) {
    if (!usernameRegex.test(normalizedUsername)) {
      throw new ApiError(
        400,
        "Username can only contain letters, numbers, and underscores.",
      );
    }

    if (normalizedUsername.length < 5 || normalizedUsername.length > 20) {
      throw new ApiError(400, "username should be 5-20 charactors long");
    }
  }

  if (normalizedEmail) {
    if (!emailRegex.test(normalizedEmail)) {
      throw new ApiError(400, "Invalid email format");
    }
  }

  return {
    fullName: normalizedFullName,
    username: normalizedUsername,
    email: normalizedEmail,
  };
};

const validateNewPassword = (incomingPasswords) => {
  const { currentPassword, newPassword } = incomingPasswords;

  const normalizedCurrentPassword = currentPassword?.trim();
  const normalizedNewPassword = newPassword?.trim();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  if (!normalizedCurrentPassword) {
    throw new ApiError(400, "Current password is required");
  }

  if (!normalizedNewPassword) {
    throw new ApiError(400, "New password is required");
  }

  if (normalizedNewPassword.length < 8) {
    throw new ApiError(400, "password must be atleast 8 charactors long");
  }

  if (!passwordRegex.test(normalizedNewPassword)) {
    throw new ApiError(
      400,
      "Password must contain uppercase, lowercase and digit",
    );
  }

  return {
    currentPassword: normalizedCurrentPassword,
    newPassword: normalizedNewPassword,
  };
};

const validatePaginateData = (paginationData) => {
  const { page, limit } = paginationData;

  const normalizedPage = Number(page) || 1;
  const normalizedLimit = Number(limit) || 10;

  if (
    (normalizedPage && !Number.isFinite(normalizedPage)) ||
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1
  ) {
    throw new ApiError(400, "Enter a positive finite page value");
  }

  if (
    (normalizedLimit && !Number.isFinite(normalizedLimit)) ||
    !Number.isInteger(normalizedLimit) ||
    normalizedLimit < 1
  ) {
    throw new ApiError(400, "Enter a positive finite limit value");
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

export { validateUpdateData, validateNewPassword, validatePaginateData };
