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

export { validateUpdateData };
