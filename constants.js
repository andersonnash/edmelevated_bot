const OWNER_ID = "861947655584219146";

function isOwner(userId) {
  return userId === OWNER_ID;
}

const VENUE_TYPES = {
  garage_party: {
    name: "Garage Party",
    cost: 2_500,
    repRequired: 0,
    passiveIncome: 20,
    baseCapacity: 25,
    staffLimit: 1,
    djLimit: 1,
    maxOwned: 10,
    description: "A small DIY party where every promoter starts.",
  },

  warehouse: {
    name: "Granary Warehouse",
    cost: 10_000,
    repRequired: 10,
    passiveIncome: 85,
    baseCapacity: 100,
    staffLimit: 3,
    djLimit: 2,
    maxOwned: 6,
    description: "A gritty warehouse space built for underground shows.",
  },

  underground_club: {
    name: "The Sub Room",
    cost: 30_000,
    repRequired: 25,
    passiveIncome: 250,
    baseCapacity: 250,
    staffLimit: 6,
    djLimit: 3,
    maxOwned: 5,
    description: "A dark basement club with loyal late-night regulars.",
  },

  downtown_venue: {
    name: "Neon Rooftop",
    cost: 75_000,
    repRequired: 50,
    passiveIncome: 700,
    baseCapacity: 600,
    staffLimit: 10,
    djLimit: 5,
    maxOwned: 3,
    description: "A stylish rooftop venue with city views and bigger crowds.",
  },

  festival_grounds: {
    name: "Desert Frequency",
    cost: 250_000,
    repRequired: 100,
    passiveIncome: 2_500,
    baseCapacity: 2_500,
    staffLimit: 25,
    djLimit: 12,
    maxOwned: 1,
    description: "A desert-scale event space for major EDM productions.",
  },
};

const EQUIPMENT_TYPES = {
  flx4: {
    name: "Pioneer DDJ-FLX4",
    cost: 500,
    passiveIncome: 15,
    rarity: "Common",
    description: "Great starter controller for local rentals.",
  },

  xdj_rx3: {
    name: "Pioneer XDJ-RX3",
    cost: 2500,
    passiveIncome: 60,
    rarity: "Rare",
    description: "Frequently rented by clubs.",
  },

  cdj_3000_pair: {
    name: "CDJ-3000 Pair",
    cost: 6000,
    passiveIncome: 250,
    rarity: "Epic",
    description: "Industry-standard festival setup.",
  },

  sound_system: {
    name: "Sound System",
    cost: 15000,
    passiveIncome: 500,
    rarity: "Epic",
    description: "High-end PA rental.",
  },

  laser_rig: {
    name: "Laser Rig",
    cost: 40000,
    passiveIncome: 900,
    rarity: "Legendary",
    description: "Premium production rental.",
  },
};

const INSURANCE_TIERS = {
  basic: {
    name: "Basic Coverage",
    cost: 10_000,
    incidentReduction: 0.15,
    closureReduction: 0.25,
    description: "Basic protection against venue incidents.",
  },

  commercial: {
    name: "Commercial Coverage",
    cost: 40_000,
    incidentReduction: 0.35,
    closureReduction: 0.5,
    description: "Stronger coverage for established venues.",
  },

  festival: {
    name: "Festival Coverage",
    cost: 150_000,
    incidentReduction: 0.6,
    closureReduction: 0.75,
    description: "Premium protection for major venues.",
  },
};

const SHOW_STAFF_ROLES = {
  bartender: { label: "Bartender", minPay: 150, bonus: 10 },
  security: { label: "Security", minPay: 200, bonus: 10 },
  vj: { label: "VJ", minPay: 175, bonus: 15 },
  promoter: { label: "Promoter", minPay: 125, bonus: 20 },
  general_staff: { label: "General Staff", minPay: 100, bonus: 5 },
};

const VENUE_STAFF_ROLES = {
  bartender: {
    label: "Bartender",
    emoji: "🍹",
    cost: 1000,
    incomeBoost: 0.05,
  },
  bouncer: {
    label: "Bouncer",
    emoji: "💪",
    cost: 1500,
    incomeBoost: 0.1,
  },
  manager: {
    label: "Manager",
    emoji: "👔",
    cost: 5000,
    incomeBoost: 0.2,
  },
  promoter: {
    label: "Promoter",
    emoji: "📣",
    cost: 2000,
    incomeBoost: 0.08,
  },
};

const VENUE_DEPARTMENTS = {
  bar: {
    name: "Bar",
    emoji: "🍺",
    column: "bar_level",
    baseCost: 1_000,
    benefitPerLevel: 10,
    reputationPerLevel: 2,
    effect: "Boosts passive income",
  },

  security: {
    name: "Security",
    emoji: "🚪",
    column: "security_level",
    baseCost: 2_500,
    benefitPerLevel: 5,
    reputationPerLevel: 1,
    effect: "Boosts venue capacity",
  },

  production: {
    name: "Production",
    emoji: "🎛",
    column: "production_level",
    baseCost: 5_000,
    benefitPerLevel: 5,
    reputationPerLevel: 3,
    effect: "Boosts show attendance",
  },

  maintenance: {
    name: "Maintenance",
    emoji: "🧹",
    column: "maintenance_level",
    baseCost: 3_000,
    benefitPerLevel: 10,
    reputationPerLevel: 1,
    effect: "Reduces future incident impact",
  },
};

const ROLES = {
  raver: {
    name: "Raver",
    emoji: "🎟",
    unlock: "Join EDM Elevated City / register",
  },

  scene_explorer: {
    name: "Scene Explorer",
    emoji: "🎮",
    unlock: "Play your first game",
  },
  crate_digger: {
    name: "Crate Digger",
    emoji: "🎵",
    unlock: "Run /crate_dig 10 times",
  },
  street_team: {
    name: "Street Team",
    emoji: "📣",
    unlock: "Run /street_team 5 times",
  },
  story_chaser: {
    name: "Story Chaser",
    emoji: "🪩",
    unlock: "Complete /rave_story 5 times",
  },
  venue_owner: {
    name: "Venue Owner",
    emoji: "🏟",
    unlock: "Buy your first venue",
  },
  promoter: {
    name: "Promoter",
    emoji: "🎤",
    unlock: "Create your first show",
  },
  profitable_promoter: {
    name: "Profitable Promoter",
    emoji: "💰",
    unlock: "Collect profit from a completed show",
  },
  scene_icon: {
    name: "Scene Icon",
    emoji: "🌟",
    unlock: "Reach 100 reputation",
  },
  city_legend: {
    name: "City Legend",
    emoji: "👑",
    unlock: "Reach Level 25",
  },
};

const CAREER_ROLES = {
  lineup_dj: {
    name: "Lineup DJ",
    emoji: "🎧",
  },
  bartender: {
    name: "Bartender",
    emoji: "🍸",
  },
  security: {
    name: "Security",
    emoji: "🛡️",
  },
  vj: {
    name: "VJ",
    emoji: "📺",
  },
  promoter: {
    name: "Promoter",
    emoji: "📣",
  },
  general_staff: {
    name: "General Staff",
    emoji: "👷",
  },
};

const WORK_JOBS = {
  door_shift: {
    name: "Door Shift",
    emoji: "🚪",
    minCash: 60,
    maxCash: 120,
    xp: 8,
    reputation: 0,
    cooldownMinutes: 30,
    flavor:
      "You worked the door, checked wristbands, and kept the line moving.",
  },

  barback_shift: {
    name: "Barback Shift",
    emoji: "🍸",
    minCash: 90,
    maxCash: 160,
    xp: 6,
    reputation: 0,
    cooldownMinutes: 45,
    flavor: "You hauled ice, restocked the bar, and somehow survived the rush.",
  },

  stagehand_loadin: {
    name: "Stagehand Load-In",
    emoji: "🔊",
    minCash: 75,
    maxCash: 140,
    xp: 15,
    reputation: 0,
    cooldownMinutes: 45,
    flavor: "You helped load subs, cables, decks, and lights into the venue.",
  },

  open_decks: {
    name: "Open Decks",
    emoji: "🎧",
    minCash: 40,
    maxCash: 100,
    xp: 22,
    reputation: 1,
    cooldownMinutes: 60,
    minLevel: 2,
    flavor:
      "You played an early open-decks slot and a few people actually noticed.",
  },

  promo_runner: {
    name: "Promo Runner",
    emoji: "📣",
    minCash: 50,
    maxCash: 110,
    xp: 12,
    reputation: 1,
    cooldownMinutes: 45,
    flavor:
      "You pushed flyers, posted stories, and helped keep the scene alive.",
  },
};

const SHOP_ITEMS = {
  title_dnb_lifer: {
    key: "title_dnb_lifer",
    type: "cosmetic_title",
    category: "genre",
    name: "DNB Lifer",
    description: "Everything sounds better at 174 BPM.",
    price: 1500,
    profileColor: 0x22d3ee,
    profileEmoji: "🥁",
    profileAccent: "174 BPM / Bassline pressure",
  },

  title_house_head: {
    key: "title_house_head",
    type: "cosmetic_title",
    category: "genre",
    name: "House Head",
    description: "Four on the floor, spiritually and emotionally.",
    price: 1500,
    profileColor: 0x22c55e,
    profileEmoji: "🏠",
    profileAccent: "Four-on-the-floor energy",
  },

  title_techno_gremlin: {
    key: "title_techno_gremlin",
    type: "cosmetic_title",
    category: "genre",
    name: "Techno Gremlin",
    description: "Dark room. No phones. Questionable sleep schedule.",
    price: 2000,
    profileColor: 0x8b5cf6,
    profileEmoji: "🕳️",
    profileAccent: "Dark room certified",
  },

  title_trance_purist: {
    key: "title_trance_purist",
    type: "cosmetic_title",
    category: "genre",
    name: "Trance Purist",
    description: "Still chasing the emotional breakdown.",
    price: 2000,
    profileColor: 0x38bdf8,
    profileEmoji: "🌌",
    profileAccent: "Melodies, lasers, feelings",
  },

  title_bassline_believer: {
    key: "title_bassline_believer",
    type: "cosmetic_title",
    category: "genre",
    name: "Bassline Believer",
    description: "Lives for low-end therapy.",
    price: 1000,
    profileColor: 0x06b6d4,
    profileEmoji: "🔊",
    profileAccent: "Low-end spiritual practice",
  },

  title_wub_cartographer: {
    key: "title_wub_cartographer",
    type: "cosmetic_title",
    category: "genre",
    name: "Wub Cartographer",
    description: "Can navigate entirely by sub-bass.",
    price: 2500,
    profileColor: 0xa855f7,
    profileEmoji: "🗺️",
    profileAccent: "Mapping the wublands",
  },

  title_flow_state: {
    key: "title_flow_state",
    type: "cosmetic_title",
    category: "flow",
    name: "Flow State",
    description: "Poi, fans, hoops, and suspiciously good balance.",
    price: 1500,
    profileColor: 0xec4899,
    profileEmoji: "🌀",
    profileAccent: "Movement is the message",
  },

  title_fire_circle_regular: {
    key: "title_fire_circle_regular",
    type: "cosmetic_title",
    category: "flow",
    name: "Fire Circle Regular",
    description: "Knows where the fuel depot is and why that matters.",
    price: 2500,
    profileColor: 0xf97316,
    profileEmoji: "🔥",
    profileAccent: "Part dancer, part fire hazard",
  },

  title_orbit_wizard: {
    key: "title_orbit_wizard",
    type: "cosmetic_title",
    category: "flow",
    name: "Orbit Wizard",
    description: "Accidentally became the visual production.",
    price: 2000,
    profileColor: 0xeab308,
    profileEmoji: "🪄",
    profileAccent: "Light trails and questionable magic",
  },

  title_glowstick_architect: {
    key: "title_glowstick_architect",
    type: "cosmetic_title",
    category: "flow",
    name: "Glowstick Architect",
    description: "Building temporary temples out of light trails.",
    price: 1500,
    profileColor: 0x84cc16,
    profileEmoji: "💚",
    profileAccent: "Neon engineering department",
  },
};

module.exports = {
  OWNER_ID,
  VENUE_TYPES,
  SHOW_STAFF_ROLES,
  EQUIPMENT_TYPES,
  INSURANCE_TIERS,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
  ROLES,
  CAREER_ROLES,
  WORK_JOBS,
  SHOP_ITEMS,
  isOwner,
};
