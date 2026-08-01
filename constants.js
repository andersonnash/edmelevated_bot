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
    passiveIncome: 150,
    investmentMultiplier: 0.5,
    insuranceCost: 250,
    baseCapacity: 25,
    staffLimit: 1,
    djLimit: 1,
    maxOwned: 10,
    description: "A small DIY party where every promoter starts.",
  },

  warehouse: {
    name: "Granary Warehouse",
    cost: 7_500,
    repRequired: 10,
    passiveIncome: 500,
    investmentMultiplier: 1,
    insuranceCost: 750,
    baseCapacity: 100,
    staffLimit: 3,
    djLimit: 2,
    maxOwned: 6,
    description: "A gritty warehouse space built for underground shows.",
  },

  underground_club: {
    name: "The Sub Room",
    cost: 22_500,
    repRequired: 25,
    passiveIncome: 1_500,
    investmentMultiplier: 2,
    insuranceCost: 2_000,
    baseCapacity: 250,
    staffLimit: 6,
    djLimit: 3,
    maxOwned: 5,
    description: "A dark basement club with loyal late-night regulars.",
  },

  downtown_venue: {
    name: "Neon Rooftop",
    cost: 60_000,
    repRequired: 50,
    passiveIncome: 4_000,
    investmentMultiplier: 4,
    insuranceCost: 5_000,
    baseCapacity: 600,
    staffLimit: 10,
    djLimit: 5,
    maxOwned: 3,
    description: "A stylish rooftop venue with city views and bigger crowds.",
  },

  festival_grounds: {
    name: "Desert Frequency",
    cost: 200_000,
    repRequired: 100,
    passiveIncome: 12_000,
    investmentMultiplier: 10,
    insuranceCost: 15_000,
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

const VENUE_INSURANCE = {
  key: "standard",
  name: "Venue Insurance",
  durationHours: 48,
  incidentReduction: 0.35,
  closureReduction: 0.5,
  description: "48-hour protection against venue incidents.",
};

const SHOW_STAFF_PAYOUT = 150;
const SHOW_STAFF_VENUE_BOOST_PER_STAFF = 0.05;
const SHOW_STAFF_VENUE_BOOST_CAP = 0.25;

const SHOW_GENRES = {
  house: "House",
  techno: "Techno",
  dnb: "Drum & Bass",
  dubstep: "Dubstep",
  trance: "Trance",
  experimental_bass: "Experimental Bass",
};

const SHOW_STAFF_ROLES = {
  staff: {
    label: "Show Staff",
    emoji: "👷",
    description: "Boosts venue income until the show runs.",
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
    effect: "Boosts venue capacity",
  },

  production: {
    name: "Production",
    emoji: "🎛",
    column: "production_level",
    baseCost: 5_000,
    benefitPerLevel: 15,
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

const DJ_BOOKING_MILESTONES = [
  {
    key: "private_party",
    name: "Private Party",
    prerequisite: "open_decks_guest_slot",
    repeatableRunsRequired: 2,
    djReputationRequired: 15,
    cash: 400,
    xp: 35,
    reputation: 3,
    djReputation: 5,
    showBonus: 5,
    scenario:
      "The host wants recognizable music, but the dance floor keeps asking for something heavier.",
    choices: [
      { key: "take_requests", label: "Take Requests", cashMultiplier: 1.15, xpBonus: 3, reputationBonus: 2, djReputationBonus: 1, showBonusBonus: 0, result: "You worked the requests into the set and won over the whole party." },
      { key: "go_underground", label: "Go Underground", cashMultiplier: 0.95, xpBonus: 12, reputationBonus: 0, djReputationBonus: 4, showBonusBonus: 2, result: "You ignored the safe route and turned the party into a tiny underground night." },
      { key: "blend_both", label: "Blend Both", cashMultiplier: 1.05, xpBonus: 8, reputationBonus: 1, djReputationBonus: 3, showBonusBonus: 1, result: "You folded the requests into your sound without losing the room." },
    ],
  },
  {
    key: "local_club_support",
    name: "Local Club Support",
    prerequisite: "private_party",
    repeatableRunsRequired: 4,
    djReputationRequired: 35,
    cash: 600,
    xp: 50,
    reputation: 5,
    djReputation: 8,
    showBonus: 8,
    scenario:
      "The headliner is running late, and the promoter asks you to extend your opening set.",
    choices: [
      { key: "build_slowly", label: "Build Slowly", cashMultiplier: 1.05, xpBonus: 5, reputationBonus: 2, djReputationBonus: 3, showBonusBonus: 2, result: "You protected the room's energy and handed the headliner a perfect floor." },
      { key: "claim_spotlight", label: "Claim the Spotlight", cashMultiplier: 1.2, xpBonus: 12, reputationBonus: 0, djReputationBonus: 2, showBonusBonus: 0, result: "You treated the extra time like a headline slot and made yourself impossible to ignore." },
      { key: "surprise_b2b", label: "Start a Surprise B2B", cashMultiplier: 1, xpBonus: 8, reputationBonus: 1, djReputationBonus: 4, showBonusBonus: 4, result: "A local DJ joined you, and the unexpected back-to-back became the story of the night." },
    ],
  },
  {
    key: "warehouse_closer",
    name: "Warehouse Closing Slot",
    prerequisite: "local_club_support",
    repeatableRunsRequired: 8,
    djReputationRequired: 70,
    cash: 850,
    xp: 70,
    reputation: 7,
    djReputation: 12,
    showBonus: 12,
    scenario:
      "The official set time is over, but the warehouse is still full and nobody wants to leave.",
    choices: [
      { key: "end_on_time", label: "End on Time", cashMultiplier: 1.1, xpBonus: 5, reputationBonus: 3, djReputationBonus: 4, showBonusBonus: 1, result: "You protected the promoter, closed cleanly, and earned serious trust." },
      { key: "play_past_curfew", label: "Play Past Curfew", cashMultiplier: 1.25, xpBonus: 15, reputationBonus: 0, djReputationBonus: 2, showBonusBonus: 3, result: "You kept the warehouse moving until the lights came on." },
      { key: "unreleased_closer", label: "Drop an Unreleased Closer", cashMultiplier: 1, xpBonus: 12, reputationBonus: 2, djReputationBonus: 5, showBonusBonus: 5, result: "You ended on an unknown track and disappeared before anyone could identify it." },
    ],
  },
];

const DJ_REPEATABLE_BOOKINGS = [
  {
    key: "community_night",
    name: "Community Night",
    genre: "career",
    unlockBooking: "open_decks_guest_slot",
    cash: 250,
    xp: 25,
    reputation: 2,
    djReputation: 3,
    showBonus: 5,
    scenario: "The regulars have heard everything, and they are waiting to see whether you brought something memorable.",
    choices: [
      { key: "forgotten_classic", label: "Dig Out a Classic", cashMultiplier: 1.1, xpBonus: 4, reputationBonus: 2, djReputationBonus: 2, showBonusBonus: 1, result: "A forgotten classic pulls the regulars onto the floor immediately." },
      { key: "new_edit", label: "Test a New Edit", cashMultiplier: 1, xpBonus: 10, reputationBonus: 0, djReputationBonus: 4, showBonusBonus: 2, result: "The new edit is rough around the edges, but the room remembers it." },
      { key: "local_guest", label: "Bring Up a Local Guest", cashMultiplier: 0.95, xpBonus: 6, reputationBonus: 2, djReputationBonus: 3, showBonusBonus: 4, result: "Sharing the booth turns a routine night into a community moment." },
    ],
  },
  {
    key: "afterparty_set",
    name: "Afterparty Set",
    genre: "career",
    unlockBooking: "private_party",
    cash: 325,
    xp: 30,
    reputation: 3,
    djReputation: 4,
    showBonus: 7,
    scenario: "The main-event crowd arrives at once, but the afterparty sound system is barely holding together.",
    choices: [
      { key: "protect_system", label: "Protect the System", cashMultiplier: 1.05, xpBonus: 4, reputationBonus: 2, djReputationBonus: 3, showBonusBonus: 1, result: "You pulled back the low end and kept the party alive without blowing the system." },
      { key: "push_redline", label: "Push It to the Redline", cashMultiplier: 1.2, xpBonus: 12, reputationBonus: 0, djReputationBonus: 2, showBonusBonus: 3, result: "The rig survives somehow, and the room talks about the set for days." },
      { key: "go_deeper", label: "Go Deep and Late", cashMultiplier: 1, xpBonus: 8, reputationBonus: 1, djReputationBonus: 4, showBonusBonus: 2, result: "You changed direction and built the kind of deep set that only works after 3 a.m." },
    ],
  },
  {
    key: "club_support",
    name: "Club Support Slot",
    genre: "career",
    unlockBooking: "local_club_support",
    cash: 400,
    xp: 35,
    reputation: 3,
    djReputation: 5,
    showBonus: 8,
    scenario: "The headliner's sound is far outside your specialty, and your final track must connect the two sets.",
    choices: [
      { key: "seamless_handoff", label: "Create a Seamless Handoff", cashMultiplier: 1.05, xpBonus: 5, reputationBonus: 2, djReputationBonus: 3, showBonusBonus: 2, result: "Your last track makes the handoff feel planned down to the second." },
      { key: "own_specialty", label: "Own Your Specialty", cashMultiplier: 1.1, xpBonus: 10, reputationBonus: 0, djReputationBonus: 4, showBonusBonus: 1, result: "You refuse to dilute your sound and leave a clear signature on the night." },
      { key: "headliner_track", label: "Play Their Track", cashMultiplier: 1, xpBonus: 6, reputationBonus: 2, djReputationBonus: 2, showBonusBonus: 4, result: "The headliner hears the transition from backstage and gives you the nod." },
    ],
  },
  {
    key: "genre_showcase",
    name: "Underground Genre Showcase",
    genre: "career",
    unlockBooking: "warehouse_closer",
    cash: 600,
    xp: 50,
    reputation: 4,
    djReputation: 7,
    showBonus: 12,
    scenario: "This crowd knows the genre deeply and will notice every selection, transition, and shortcut.",
    choices: [
      { key: "purist_set", label: "Play a Purist Set", cashMultiplier: 1.05, xpBonus: 5, reputationBonus: 3, djReputationBonus: 4, showBonusBonus: 2, result: "The heads recognize every detail and reward you for respecting the sound." },
      { key: "cross_genres", label: "Cross Genre Boundaries", cashMultiplier: 1.1, xpBonus: 12, reputationBonus: 0, djReputationBonus: 4, showBonusBonus: 3, result: "The experiment divides opinion, but nobody calls it forgettable." },
      { key: "unreleased_set", label: "Play Mostly Unreleased Music", cashMultiplier: 1, xpBonus: 10, reputationBonus: 2, djReputationBonus: 5, showBonusBonus: 5, result: "The crowd spends the entire set trying to identify tracks that do not exist online." },
    ],
  },
];

const REPEATABLE_BOOKING_COOLDOWN_HOURS = 6;
const REPEATABLE_BOOKING_DAILY_LIMIT = 3;

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
  SHOW_STAFF_VENUE_BOOST_PER_STAFF,
  SHOW_STAFF_VENUE_BOOST_CAP,
  SHOW_GENRES,
  DJ_BOOKINGS,
  DJ_BOOKING_MILESTONES,
  DJ_REPEATABLE_BOOKINGS,
  REPEATABLE_BOOKING_COOLDOWN_HOURS,
  REPEATABLE_BOOKING_DAILY_LIMIT,
  isBotAdmin,
  isOwner,
};
