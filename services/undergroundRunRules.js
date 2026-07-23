const MAX_ENTRY = 25;

const APPROACHES = {
  careful: {
    key: "careful",
    label: "Play It Safe",
    emoji: "🧠",
    bustChance: 0.05,
    minCash: 30,
    maxCash: 55,
    xp: 3,
  },
  balanced: {
    key: "balanced",
    label: "Take the Opportunity",
    emoji: "⚡",
    bustChance: 0.15,
    minCash: 60,
    maxCash: 105,
    xp: 5,
  },
  risky: {
    key: "risky",
    label: "Push Your Luck",
    emoji: "🔥",
    bustChance: 0.35,
    minCash: 115,
    maxCash: 190,
    xp: 8,
  },
};

const SCENARIOS = {
  side_room_rescue: {
    key: "side_room_rescue",
    emoji: "🔊",
    title: "Rescue the Side Room",
    summary: "A promoter offers you a cut if you can save an empty side room.",
    beats: [
      "You follow the promoter through a service hallway while the main room shakes the walls.",
      "The side room has twelve people, one tired bartender, and a DJ already packing their USBs.",
      "The promoter points at the booth. You have one chance to change the room before it gets shut down.",
    ],
    success: {
      careful: "You rebuild the room slowly, keep the bar happy, and leave with a modest but clean cut.",
      balanced: "You change direction at exactly the right moment and turn the side room into its own party.",
      risky: "You slam into an unexpected closing run and pull half the main-room crowd through the hallway.",
    },
    bust: "The room never catches. The promoter closes it early, and tonight's stake disappears with the opportunity.",
  },
  warehouse_load_in: {
    key: "warehouse_load_in",
    emoji: "🏭",
    title: "Beat the Doors",
    summary: "A warehouse crew is behind schedule and needs help before doors open.",
    beats: [
      "You arrive to find cases stacked in the loading bay and a countdown running on somebody's phone.",
      "The lighting truss is late, the subs are untested, and the crew lead is making decisions too quickly.",
      "Doors open soon. You choose where to put your effort while everyone else starts to panic.",
    ],
    success: {
      careful: "You organize the cable runs, prevent mistakes, and earn a dependable crew payout.",
      balanced: "You split the crew intelligently and get the essential production online just before doors.",
      risky: "You attempt the full setup, race the clock, and somehow bring the entire room online at once.",
    },
    bust: "The rushed setup fails inspection. The crew loses the bonus, and your stake goes with it.",
  },
  failed_usb: {
    key: "failed_usb",
    emoji: "💾",
    title: "The Dead USB",
    summary: "A touring DJ's USB fails while the booth looks for a replacement plan.",
    beats: [
      "The current track has less than three minutes left when the touring DJ's library disappears.",
      "The booth manager asks whether you have music ready. The crowd has no idea anything is wrong.",
      "You connect your drive and scan the room. Your next move will either save the transition or expose the disaster.",
    ],
    success: {
      careful: "You extend the groove, buy the booth time, and collect a quiet emergency payout.",
      balanced: "You build a clean bridge into your own material and make the rescue feel intentional.",
      risky: "You take over completely, drop an untested weapon, and turn a technical failure into the night's story.",
    },
    bust: "The handoff collapses, the room notices, and the emergency payment vanishes in the confusion.",
  },
  mystery_crate: {
    key: "mystery_crate",
    emoji: "📦",
    title: "The Unmarked Crate",
    summary: "A record seller offers you an unmarked crate with an unusual condition.",
    beats: [
      "The seller pulls a sealed crate from beneath the counter and refuses to explain where it came from.",
      "You can preview only one record. The rest must be judged by labels, handwriting, and instinct.",
      "Another buyer is already walking over. You decide how much confidence to place in the unknown collection.",
    ],
    success: {
      careful: "You identify a few reliable records, flip them locally, and take a small guaranteed margin.",
      balanced: "You spot a forgotten pressing in the middle and sell it to a collector for a strong return.",
      risky: "You take the entire crate and uncover a genuinely rare archive hidden beneath the filler.",
    },
    bust: "The promising labels hide warped records and worthless bootlegs. The crate eats your stake.",
  },
  afterhours_address: {
    key: "afterhours_address",
    emoji: "🌙",
    title: "Follow the Address",
    summary: "An afterhours address starts circulating, but nobody knows who is behind it.",
    beats: [
      "A location pin lands in three group chats at once with no flyer and no lineup.",
      "You reach an industrial block where bass leaks from one building and security watches another.",
      "Someone at the door recognizes you and offers a way inside—if you are willing to help the night.",
    ],
    success: {
      careful: "You handle a simple door task, avoid the chaos, and leave with a small share.",
      balanced: "You solve a staffing problem, become part of the operation, and earn a respectable cut.",
      risky: "You take responsibility for the final room and turn a questionable address into a sunrise success.",
    },
    bust: "The night gets shut down before your plan works. Your temporary stake is lost, but your regular wallet stays safe.",
  },
};

function entryForCash(cash) {
  return Math.min(MAX_ENTRY, Math.max(0, Number(cash || 0)));
}

function dailyRewardMultiplier(completedToday) {
  if (completedToday < 3) return 1;
  if (completedToday < 6) return 0.5;
  return 0.25;
}

function resolveEncounter(approachKey, random = Math.random) {
  const approach = APPROACHES[approachKey];
  if (!approach) return null;

  if (random() < approach.bustChance) {
    return { approach, busted: true, cashGain: 0, xpGain: approach.xp };
  }

  const cashGain =
    approach.minCash +
    Math.floor(random() * (approach.maxCash - approach.minCash + 1));

  return { approach, busted: false, cashGain, xpGain: approach.xp };
}

function scaledPayout(stash, xpStash, completedToday) {
  const multiplier = dailyRewardMultiplier(completedToday);
  return {
    multiplier,
    cash: Math.floor(Math.max(0, stash) * multiplier),
    xp: Math.floor(Math.max(0, xpStash) * multiplier),
  };
}

function scenarioChoices(random = Math.random, count = 3) {
  const choices = Object.values(SCENARIOS);
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }
  return choices.slice(0, count);
}

module.exports = {
  APPROACHES,
  MAX_ENTRY,
  SCENARIOS,
  dailyRewardMultiplier,
  entryForCash,
  resolveEncounter,
  scaledPayout,
  scenarioChoices,
};
