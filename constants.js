const OWNER_ID = "861947655584219146";
const SHOW_CREATION_XP = 5;
const SHOW_COMPLETION_XP = 35;

function isOwner(userId) {
  return userId === OWNER_ID;
}

const BOT_ADMIN_ID = process.env.BOT_ADMIN_ID || OWNER_ID;

function isBotAdmin(userId) {
  return userId === BOT_ADMIN_ID;
}

const VENUE_TYPES = {
  garage_party: {
    name: "Garage Party",
    cost: 2_500,
    repRequired: 0,
    passiveIncome: 125,
    investmentMultiplier: 0.5,
    insuranceCost: 250,
    baseCapacity: 25,
    staffLimit: 1,
    maxOwned: 10,
    description: "A small DIY party where every promoter starts.",
  },

  warehouse: {
    name: "Granary Warehouse",
    cost: 7_500,
    repRequired: 10,
    passiveIncome: 350,
    investmentMultiplier: 1,
    insuranceCost: 750,
    baseCapacity: 100,
    staffLimit: 3,
    maxOwned: 6,
    description: "A gritty warehouse space built for underground shows.",
  },

  underground_club: {
    name: "The Sub Room",
    cost: 22_500,
    repRequired: 25,
    passiveIncome: 900,
    investmentMultiplier: 2,
    insuranceCost: 2_000,
    baseCapacity: 250,
    staffLimit: 6,
    maxOwned: 5,
    description: "A dark basement club with loyal late-night regulars.",
  },

  downtown_venue: {
    name: "Neon Rooftop",
    cost: 60_000,
    repRequired: 50,
    passiveIncome: 2_000,
    investmentMultiplier: 4,
    insuranceCost: 5_000,
    baseCapacity: 600,
    staffLimit: 10,
    maxOwned: 3,
    description: "A stylish rooftop venue with city views and bigger crowds.",
  },

  festival_grounds: {
    name: "Desert Frequency",
    cost: 200_000,
    repRequired: 100,
    passiveIncome: 5_000,
    investmentMultiplier: 10,
    insuranceCost: 15_000,
    baseCapacity: 2_500,
    staffLimit: 25,
    maxOwned: 1,
    description: "A desert-scale event space for major EDM productions.",
  },
};

const EQUIPMENT_TYPES = {
  flx4: {
    name: "Pioneer DDJ-FLX4",
    cost: 500,
    passiveIncome: 15,
    attendanceBonus: 0.02,
    productionBonus: 2,
    rarity: "Common",
    description: "Great starter controller for local rentals.",
  },

  xdj_rx3: {
    name: "Pioneer XDJ-RX3",
    cost: 2500,
    passiveIncome: 60,
    attendanceBonus: 0.04,
    productionBonus: 4,
    rarity: "Rare",
    description: "Frequently rented by clubs.",
  },

  cdj_3000_pair: {
    name: "CDJ-3000 Pair",
    cost: 6000,
    passiveIncome: 250,
    attendanceBonus: 0.06,
    productionBonus: 7,
    rarity: "Epic",
    description: "Industry-standard festival setup.",
  },

  sound_system: {
    name: "Sound System",
    cost: 15000,
    passiveIncome: 500,
    attendanceBonus: 0.08,
    productionBonus: 10,
    rarity: "Epic",
    description: "High-end PA rental.",
  },

  laser_rig: {
    name: "Laser Rig",
    cost: 40000,
    passiveIncome: 900,
    attendanceBonus: 0.1,
    productionBonus: 14,
    rarity: "Legendary",
    description: "Premium production rental.",
  },
};

const VENUE_INSURANCE = {
  key: "standard",
  name: "Venue Insurance",
  durationHours: 48,
  incidentReduction: 0.35,
  closureReduction: 0.5,
  description: "48-hour protection against venue incidents.",
};

const SHOW_STAFF_PAYOUT = 150;
const SHOW_GENRES = {
  house: "House",
  techno: "Techno",
  dnb: "Drum & Bass",
  dubstep: "Dubstep",
  trance: "Trance",
  experimental_bass: "Experimental Bass",
};

// These are simulated in-game booking outcomes, not appearances, endorsements,
// or affiliations with the real-world artists named.
const NPC_DJ_ROSTER = {
  garage_party: [
    { key: "mija", name: "Mija", tier: "Local favorite", fee: 175, demand: 6 },
    { key: "vnssa", name: "VNSSA", tier: "Local favorite", fee: 225, demand: 8 },
    { key: "nitepunk", name: "Nitepunk", tier: "Local favorite", fee: 275, demand: 10 },
  ],
  warehouse: [
    { key: "j_worra", name: "J. Worra", tier: "Warehouse draw", fee: 1_000, demand: 25 },
    { key: "malaa", name: "Malaa", tier: "Warehouse draw", fee: 1_200, demand: 30 },
    { key: "eptic", name: "Eptic", tier: "Warehouse draw", fee: 1_500, demand: 35 },
  ],
  underground_club: [
    { key: "cloonee", name: "Cloonee", tier: "Club headliner", fee: 5_000, demand: 60 },
    { key: "of_the_trees", name: "Of The Trees", tier: "Club headliner", fee: 6_000, demand: 70 },
    { key: "knock2", name: "Knock2", tier: "Club headliner", fee: 7_500, demand: 80 },
  ],
  downtown_venue: [
    { key: "chris_lake", name: "Chris Lake", tier: "City headliner", fee: 20_000, demand: 140 },
    { key: "rezz", name: "REZZ", tier: "City headliner", fee: 25_000, demand: 160 },
    { key: "zeds_dead", name: "Zeds Dead", tier: "City headliner", fee: 30_000, demand: 180 },
  ],
  festival_grounds: [
    { key: "skrillex", name: "Skrillex", tier: "Festival headliner", fee: 100_000, demand: 400 },
    { key: "john_summit", name: "John Summit", tier: "Festival headliner", fee: 125_000, demand: 500 },
    { key: "fred_again", name: "Fred again..", tier: "Festival headliner", fee: 150_000, demand: 600 },
  ],
};

const SHOW_STAFF_ROLES = {
  staff: {
    label: "Show Staff",
    emoji: "👷",
    description: "Helps the show run smoothly and improves its staffing score.",
  },
  door_crew: {
    label: "Door Crew",
    emoji: "🚪",
    description: "Keeps entry and the guest list moving.",
  },
  bar_support: {
    label: "Bar Support",
    emoji: "🍹",
    description: "Keeps the bar stocked through the rush.",
  },
  stage_crew: {
    label: "Stage Crew",
    emoji: "🎛️",
    description: "Keeps changeovers and production on schedule.",
  },
  guest_services: {
    label: "Guest Services",
    emoji: "🎟️",
    description: "Handles crowd questions and guest issues.",
  },
  promo_crew: {
    label: "Promo Crew",
    emoji: "📣",
    description: "Keeps the event visible before doors open.",
  },
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
    name: "Bar Program",
    emoji: "🍺",
    column: "bar_level",
    baseCost: 1_000,
    benefitPerLevel: 15,
    maxLevel: 3,
    effect: "Boosts venue income",
    levelNames: [
      "No Bar Program",
      "Beer & Wine Service",
      "Full Bar",
      "Premium Cocktail Program",
    ],
  },

  security: {
    name: "Security",
    emoji: "🚪",
    column: "security_level",
    baseCost: 2_500,
    benefitPerLevel: 20,
    maxLevel: 3,
    effect: "Boosts venue capacity",
  },

  production: {
    name: "Production",
    emoji: "🎛",
    column: "production_level",
    baseCost: 5_000,
    benefitPerLevel: 15,
    maxLevel: 3,
    effect: "Boosts show attendance",
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
    unlock: "Complete your first city activity",
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
    unlock: "Reach 100 Scene Reputation",
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

const WORK_SCENARIOS = [
  {
    key: "door_rush",
    name: "Door Shift",
    emoji: "🚪",
    minCash: 75,
    maxCash: 125,
    xp: 8,
    reputation: 0,
    steps: [
      "You arrive at the venue and find the entry line wrapped around the block.",
      "The guest list freezes while three groups argue about missing names.",
      "You reorganize the line, verify the list by hand, and keep the doors moving.",
    ],
    result: "You survived the door rush without losing the crowd or the promoter's trust.",
  },
  {
    key: "barback_emergency",
    name: "Barback Emergency",
    emoji: "🍸",
    minCash: 90,
    maxCash: 145,
    xp: 9,
    reputation: 0,
    steps: [
      "You clock in just as the main bar runs out of ice and clean glassware.",
      "Orders pile up while somebody discovers the backup cooler was never stocked.",
      "You rebuild the station, haul supplies through the crowd, and rescue the rush.",
    ],
    result: "The bar stays open, the line disappears, and the exhausted bartender pays you out.",
  },
  {
    key: "stagehand_load_in",
    name: "Stagehand Load-In",
    emoji: "🔊",
    minCash: 85,
    maxCash: 150,
    xp: 12,
    reputation: 0,
    steps: [
      "A production truck arrives late with doors opening in less than an hour.",
      "You unload subs, trace power, and discover two cases were labeled incorrectly.",
      "The final cable lands just before soundcheck, and the system comes alive.",
    ],
    result: "The room is ready on time, and the production lead adds your name to the paid crew list.",
  },
  {
    key: "street_promo_shift",
    name: "Street Promo Shift",
    emoji: "📣",
    minCash: 70,
    maxCash: 120,
    xp: 10,
    reputation: 0,
    steps: [
      "A promoter hands you a stack of flyers and a list of places that supposedly allow posters.",
      "Rain starts halfway through the route, forcing you into group chats and late-night food lines.",
      "You finish the stack, land several reposts, and send proof back to the promoter.",
    ],
    result: "The campaign reaches the right crowd, and the promoter sends your shift payment.",
  },
  {
    key: "coat_check_chaos",
    name: "Coat-Check Chaos",
    emoji: "🧥",
    minCash: 80,
    maxCash: 135,
    xp: 9,
    reputation: 0,
    steps: [
      "The temperature drops, and every person entering the venue suddenly has a jacket.",
      "A rack jams while ticket numbers begin arriving out of order.",
      "You rebuild the system, find the missing coats, and clear the line before closing.",
    ],
    result: "Every jacket finds its owner, and management pays you for preventing a complete disaster.",
  },
  {
    key: "after_show_strike",
    name: "After-Show Strike",
    emoji: "🧹",
    minCash: 100,
    maxCash: 160,
    xp: 14,
    reputation: 0,
    steps: [
      "The crowd leaves, the lights come up, and the venue looks like a storm passed through it.",
      "You coil cables, break down the booth, and separate rented gear from house equipment.",
      "The last case locks, the floor clears, and the truck finally pulls away.",
    ],
    result: "You finish the strike faster than expected and collect the late-night crew payout.",
  },
];

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
  SHOW_CREATION_XP,
  SHOW_COMPLETION_XP,
  VENUE_TYPES,
  EQUIPMENT_TYPES,
  VENUE_INSURANCE,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
  ROLES,
  CAREER_ROLES,
  WORK_SCENARIOS,
  SHOP_ITEMS,
  BOT_ADMIN_ID,
  SHOW_STAFF_ROLES,
  SHOW_STAFF_PAYOUT,
  SHOW_GENRES,
  NPC_DJ_ROSTER,
  isBotAdmin,
  isOwner,
};
