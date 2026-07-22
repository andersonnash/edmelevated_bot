function getLevelFromXp(xp) {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function getLevelTitle(level) {
  const titles = {
    1: "New Raver",
    2: "Dancefloor Regular",
    3: "Scene Supporter",
    4: "Street Team",
    5: "Promoter",
    6: "Venue Insider",
    7: "Scene Builder",
    8: "Local Legend",
    9: "City Icon",
    10: "EDMELEVATED Elite",
    11: "Rave Tycoon",
    12: "Underground King",
    13: "Festival Mogul",
    14: "Global Icon",
    15: "Music Deity",
  };
  return titles[level] || `Legend Lvl ${level}`;
}

module.exports = { getLevelFromXp, getLevelTitle };
