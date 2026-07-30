function randomShowData() {
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

  const now = new Date();
  const minDays = 3;
  const maxDays = 14;

  const randomDays =
    Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;

  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + randomDays);

  const formattedDate = [
    futureDate.getFullYear(),
    String(futureDate.getMonth() + 1).padStart(2, "0"),
    String(futureDate.getDate()).padStart(2, "0"),
  ].join("-");

  const name =
    `${adjectives[Math.floor(Math.random() * adjectives.length)]} ` +
    `${nouns[Math.floor(Math.random() * nouns.length)]}`;

  const price = prices[Math.floor(Math.random() * prices.length)];

  return {
    name,
    date: formattedDate,
    price,
  };
}

function randomContestName(showName) {
  const prefixes = [
    "VIP",
    "Backstage",
    "Last Minute",
    "Guest List",
    "Golden Ticket",
    "Bass Drop",
    "Flash",
    "Lucky",
    "Afterhours",
    "Warehouse",
  ];

  const endings = [
    "Giveaway",
    "Drawing",
    "Drop",
    "Contest",
    "Challenge",
    "Pass",
    "Experience",
    "Entry",
    "Sweepstakes",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const ending = endings[Math.floor(Math.random() * endings.length)];

  return `${prefix} ${ending} — ${showName}`;
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
  randomContestName,
  todayString,
};
