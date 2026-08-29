const createSafeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return safeUser;
};

export { createSafeUser };
