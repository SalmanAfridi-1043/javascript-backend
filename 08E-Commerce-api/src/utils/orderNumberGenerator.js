const generateOrderNumber = () => {
  // ORD-20260903-ABC123 - task is to generate code like this

  const numbers = "0123456789";
  const alphaNumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const shortNumber = "ORD-";

  // for generating only 8 random numbers
  for (let i = 0; i <= 7; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);

    shortNumber += numbers[randomIndex];
  }

  shortNumber += "-";

  // for generating 6 alphaNumeric charactors
  for (let i = 0; i <= 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphaNumeric.length);

    shortNumber += alphaNumeric[randomIndex];
  }

  return shortNumber;
};

export { generateOrderNumber };
