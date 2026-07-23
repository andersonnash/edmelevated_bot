const FIRST_VENUE_COST = 2_500;
const POST_SHOW_CASH_TARGET = 2_750;

const SHOWCASE_CHOICES = {
  crowd_first: {
    key: "crowd_first",
    label: "Read the Room",
    emoji: "🪩",
    score: 78,
    xp: 45,
    sceneReputation: 4,
    result:
      "You keep the room moving, adjust when the energy dips, and finish with a packed borrowed floor.",
  },
  production_first: {
    key: "production_first",
    label: "Polish the Production",
    emoji: "🎛️",
    score: 84,
    xp: 50,
    sceneReputation: 5,
    result:
      "You solve the rough sound, tighten every transition, and make borrowed gear feel surprisingly professional.",
  },
  community_first: {
    key: "community_first",
    label: "Build a Community Moment",
    emoji: "🤝",
    score: 81,
    xp: 48,
    sceneReputation: 6,
    result:
      "You share the spotlight, bring the local crowd together, and leave the room wanting another night.",
  },
};

function journeyRequirements({ equipmentCount = 0, openDecksComplete = false, activities = {} }) {
  return {
    equipment: equipmentCount > 0,
    openDecks: openDecksComplete,
    streetTeam: Number(activities.street_team_runs || 0) > 0,
    sceneActivity:
      Number(activities.crate_digs || 0) > 0 ||
      Number(activities.rave_stories || 0) > 0,
  };
}

function showcaseUnlocked(input) {
  return Object.values(journeyRequirements(input)).every(Boolean);
}

function showcaseCashReward(currentCash) {
  return Math.max(900, POST_SHOW_CASH_TARGET - Math.max(0, currentCash));
}

function getShowcaseChoice(choiceKey) {
  return SHOWCASE_CHOICES[choiceKey] || null;
}

module.exports = {
  FIRST_VENUE_COST,
  POST_SHOW_CASH_TARGET,
  SHOWCASE_CHOICES,
  getShowcaseChoice,
  journeyRequirements,
  showcaseCashReward,
  showcaseUnlocked,
};
