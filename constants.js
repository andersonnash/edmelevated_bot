const OWNER_ID = "861947655584219146";

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
    passiveIncome: 100,
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
    passiveIncome: 350,
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
    passiveIncome: 850,
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
    passiveIncome: 1_500,
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
    passiveIncome: 4_000,
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
    durationHours: 48,
    incidentReduction: 0.15,
    closureReduction: 0.25,
    description: "Basic 48-hour protection against venue incidents.",
  },

  commercial: {
    name: "Commercial Coverage",
    cost: 40_000,
    durationHours: 72,
    incidentReduction: 0.35,
    closureReduction: 0.5,
    description: "Stronger temporary coverage for established venues.",
  },

  festival: {
    name: "Festival Coverage",
    cost: 150_000,
    durationHours: 168,
    incidentReduction: 0.6,
    closureReduction: 0.75,
    description: "Premium week-long protection for major venues.",
  },
};

const SHOW_STAFF_PAYOUT = 150;
const SHOW_STAFF_VENUE_BOOST_PER_STAFF = 0.05;
const SHOW_STAFF_VENUE_BOOST_CAP = 0.25;

const SHOW_STAFF_ROLES = {
  staff: {
    label: "Show Staff",
    emoji: "👷",
    description: "Boosts venue passive income until the show runs.",
  },

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
    benefitPerLevel: 15,
    reputationPerLevel: 2,
    effect: "Boosts passive income",
  },

  security: {
    name: "Security",
    emoji: "🚪",
    column: "security_level",
    baseCost: 2_500,
    benefitPerLevel: 20,
    reputationPerLevel: 1,
    effect: "Boosts venue capacity",
  },

  production: {
    name: "Production",
    emoji: "🎛",
    column: "production_level",
    baseCost: 5_000,
    benefitPerLevel: 15,
    reputationPerLevel: 3,
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

const DJ_BOOKINGS = {
  openDecks: {
    key: "open_decks_guest_slot",
    name: "Open Decks Guest Slot",
    baseReward: {
      cash: 250,
      xp: 25,
      reputation: 2,
      djReputation: 3,
    },
    genres: {
      house: {
        label: "House",
        openers: [
          {
            key: "rooftop_edit",
            label: "A glittery rooftop house edit",
            bonus: { cash: 75, xp: 5, reputation: 1, djReputation: 1 },
            result:
              "The room warms up fast. It is safe, clean, and people start moving before they realize it.",
          },
          {
            key: "classic_groove",
            label: "A classic piano groove",
            bonus: { cash: 50, xp: 8, reputation: 2, djReputation: 1 },
            result:
              "A few older heads immediately clock the selection. Someone near the back yells, “Okay, I see you.”",
          },
          {
            key: "late_night",
            label: "A smooth late-night vocal cut",
            bonus: { cash: 35, xp: 10, reputation: 2, djReputation: 2 },
            result:
              "It is a little emotional for an opener, but it works. The room leans in instead of tuning out.",
          },
        ],
      },

      dnb: {
        label: "Drum & Bass",
        openers: [
          {
            key: "liquid_roller",
            label: "A deep liquid roller",
            bonus: { cash: 35, xp: 12, reputation: 2, djReputation: 2 },
            result:
              "The dancers do not explode immediately, but the heads notice. A few people ask who is playing.",
          },
          {
            key: "neuro_weapon",
            label: "A filthy neurofunk weapon",
            bonus: { cash: 20, xp: 15, reputation: 3, djReputation: 2 },
            result:
              "It is aggressive for the room, but the energy spikes. The front row gets ugly in the best way.",
          },
          {
            key: "jungle_flip",
            label: "A classic jungle flip",
            bonus: { cash: 45, xp: 10, reputation: 3, djReputation: 2 },
            result:
              "The breakbeat catches people off guard. A few ravers start moving like they have been waiting for this.",
          },
          {
            key: "emotional_vocal",
            label: "An unreleased emotional vocal tune",
            bonus: { cash: 15, xp: 18, reputation: 4, djReputation: 3 },
            result:
              "Risky choice. It does not hit everyone, but the people it hits remember your name.",
          },
        ],
      },

      dubstep: {
        label: "Dubstep",
        openers: [
          {
            key: "deep_wub",
            label: "A deep 140 wub",
            bonus: { cash: 45, xp: 8, reputation: 2, djReputation: 1 },
            result:
              "The subs do most of the talking. The room settles into a dark little pocket.",
          },
          {
            key: "festival_riddim",
            label: "A reckless festival riddim plate",
            bonus: { cash: 70, xp: 6, reputation: 1, djReputation: 1 },
            result:
              "Subtle? Absolutely not. Effective? Unfortunately, yes. The crowd wakes up instantly.",
          },
          {
            key: "melodic_drop",
            label: "A melodic bass anthem",
            bonus: { cash: 55, xp: 8, reputation: 2, djReputation: 2 },
            result:
              "Big feelings, big drop, easy crowd connection. Someone is definitely filming this on a cracked phone.",
          },
        ],
      },

      techno: {
        label: "Techno",
        openers: [
          {
            key: "warehouse_stomper",
            label: "A warehouse stomper",
            bonus: { cash: 35, xp: 10, reputation: 2, djReputation: 2 },
            result:
              "No tricks. Just pressure. The room locks into the groove and stays there.",
          },
          {
            key: "acid_tool",
            label: "A nasty acid tool",
            bonus: { cash: 25, xp: 14, reputation: 3, djReputation: 2 },
            result:
              "The acid line bends the room sideways. It is not for everyone, which is exactly why it works.",
          },
          {
            key: "hypnotic_groove",
            label: "A hypnotic rolling groove",
            bonus: { cash: 40, xp: 10, reputation: 2, djReputation: 2 },
            result:
              "The set starts patient and confident. People slowly stop talking and start moving.",
          },
        ],
      },

      experimental: {
        label: "Experimental Bass",
        openers: [
          {
            key: "halftime_oddity",
            label: "A weird halftime creature",
            bonus: { cash: 10, xp: 18, reputation: 3, djReputation: 3 },
            result:
              "Half the room looks confused. The other half looks like they just found their new favorite problem.",
          },
          {
            key: "leftfield_bass",
            label: "A left-field bass ritual",
            bonus: { cash: 15, xp: 16, reputation: 4, djReputation: 3 },
            result:
              "This is not the safe choice. But the right people notice, and those people talk.",
          },
          {
            key: "unreleased_glitch",
            label: "An unreleased glitchy problem",
            bonus: { cash: 5, xp: 20, reputation: 5, djReputation: 3 },
            result:
              "It almost falls apart twice. Somehow that makes it better. The booth suddenly has visitors.",
          },
        ],
      },
    },
  },
};

module.exports = {
  OWNER_ID,
  VENUE_TYPES,
  EQUIPMENT_TYPES,
  INSURANCE_TIERS,
  VENUE_DEPARTMENTS,
  VENUE_STAFF_ROLES,
  ROLES,
  CAREER_ROLES,
  WORK_JOBS,
  SHOP_ITEMS,
  BOT_ADMIN_ID,
  SHOW_STAFF_ROLES,
  SHOW_STAFF_PAYOUT,
  SHOW_STAFF_VENUE_BOOST_PER_STAFF,
  SHOW_STAFF_VENUE_BOOST_CAP,
  DJ_BOOKINGS,
  isBotAdmin,
  isOwner,
};
