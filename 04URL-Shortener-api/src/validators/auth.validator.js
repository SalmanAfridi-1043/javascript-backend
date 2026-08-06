import { ApiError } from "../utils/ApiError.js";

const validateRegisterInput = (data) => {
  const { fullName, username, email, password } = data;

  const normalizedFullName = fullName?.trim();
  const normalizedUsername = username?.trim().toLowerCase();
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPassword = password?.trim();

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  if (!normalizedFullName) {
    throw new ApiError(400, "Full name is required");
  }
  if (normalizedFullName.length < 5 || normalizedFullName.length > 30) {
    throw new ApiError(
      400,
      "Full name charactors should be in between 5 to 30",
    );
  }

  if (!normalizedUsername) {
    throw new ApiError(400, "username is required");
  }

  if (!usernameRegex.test(normalizedUsername)) {
    throw new ApiError(
      400,
      "Username can only contain letters, numbers, and underscores.",
    );
  }

  if (normalizedUsername.length < 5 || normalizedUsername.length > 20) {
    throw new ApiError(400, "username should be 5-20 charactors long");
  }

  if (!normalizedEmail) {
    throw new ApiError(400, "email is required");
  }
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!normalizedPassword) {
    throw new ApiError(400, "password is required");
  }

  if (normalizedPassword.length < 8) {
    throw new ApiError(400, "password must be atleast 8 charactors long");
  }
  if (!passwordRegex.test(normalizedPassword)) {
    throw new ApiError(
      400,
      "Password must contain lowercase, uppercase and digit",
    );
  }

  return {
    fullName: normalizedFullName,
    username: normalizedUsername,
    email: normalizedEmail,
    password: normalizedPassword,
  };
};

const validateLoginInput = (data) => {
  const { username, email, password } = data;

  const normalizedUsername = username?.trim().toLowerCase() || null;
  const normalizedEmail = email?.trim().toLowerCase() || null;

  //just wana return username or email if exists
  const loginIdentifier = normalizedEmail || normalizedUsername;
  const normalizedPassword = password?.trim();

  if (!loginIdentifier) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!normalizedPassword) {
    throw new ApiError(400, "Password is required");
  }

  return {
    loginIdentifier,
    password: normalizedPassword,
  };
};

export { validateRegisterInput, validateLoginInput };
