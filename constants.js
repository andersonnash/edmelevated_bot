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

const STAFF_ROLES = {
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

module.exports = {
  OWNER_ID,
  VENUE_TYPES,
  STAFF_ROLES,
  EQUIPMENT_TYPES,
  INSURANCE_TIERS,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
  isOwner,
};
