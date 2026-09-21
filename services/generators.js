function randomShowData({ unavailableDates = [], now = new Date(), random = Math.random } = {}) {
  const adjectives = [
    "Midnight",
    "Subspace",
    "Electric",
    "Neon",
    "Underground",
    "801",
    "Afterhours",
    "Wasatch",
    "Bass",
    "Laser",
  ];

  const nouns = [
    "Pulse",
    "Rush",
    "Frequency",
    "Spectrum",
    "Signal",
    "Ritual",
    "Transmission",
    "Echo",
    "Dream",
    "Sessions",
  ];

  const prices = [20, 25, 30, 35, 40, 50];

  const minDays = 3;
  const maxDays = 14;
  const blockedDates = new Set(unavailableDates);
  const availableDates = [];

  for (let days = minDays; days <= maxDays; days += 1) {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    const formattedDate = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, "0"),
      String(futureDate.getDate()).padStart(2, "0"),
    ].join("-");
    if (!blockedDates.has(formattedDate)) availableDates.push(formattedDate);
  }

  if (!availableDates.length) return null;

  const formattedDate =
    availableDates[Math.floor(random() * availableDates.length)];

  const name =
    `${adjectives[Math.floor(random() * adjectives.length)]} ` +
    `${nouns[Math.floor(random() * nouns.length)]}`;

  const price = prices[Math.floor(random() * prices.length)];

  return {
    name,
    date: formattedDate,
    price,
  };
}

function todayString() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

module.exports = {
  randomShowData,
  todayString,
};
