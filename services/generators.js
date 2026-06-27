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
  const minDays = 5;
  const maxDays = 10;

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

function randomShowEvent() {
  const roll = Math.random();

  if (roll < 0.6) {
    return {
      title: "Normal Night",
      attendance: 0,
      revenueMultiplier: 1,
      reputation: 0,
    };
  }

  if (roll < 0.72) {
    return {
      title: "📸 Local Influencer Posted",
      attendance: 50,
      revenueMultiplier: 1.2,
      reputation: 8,
    };
  }

  if (roll < 0.82) {
    return {
      title: "🔥 TikTok Clip Went Viral",
      attendance: 100,
      revenueMultiplier: 1.4,
      reputation: 15,
    };
  }

  if (roll < 0.9) {
    return {
      title: "🌧 Rainstorm",
      attendance: -50,
      revenueMultiplier: 0.8,
      reputation: -5,
    };
  }

  if (roll < 0.96) {
    return {
      title: "🚔 Noise Complaint",
      attendance: -100,
      revenueMultiplier: 0.6,
      reputation: -10,
    };
  }

  return {
    title: "🪩 Legendary Night",
    attendance: 250,
    revenueMultiplier: 2,
    reputation: 40,
  };
}

module.exports = {
  randomShowData,
  randomContestName,
  randomShowEvent,
  todayString,
};
