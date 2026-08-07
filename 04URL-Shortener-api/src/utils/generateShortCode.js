const generateShortCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  const shortCode = "";

  for (let i = 0; i <= 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);

    shortCode += chars[randomIndex];
  }

  return shortCode;
};

export { generateShortCode };

