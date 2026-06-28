const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { checkCooldown } = require("../services/cooldowns");

const { addXp, announceLevelUp } = require("../services/xp");

const { addRole } = require("../services/roles");
const { addCash } = require("../services/economy");
const { addPendingPayout } = require("../services/economy");
const { money } = require("../services/formatters");

const db = require("../db");

const rewards = [
  {
    rarity: "Common Track",
    attendance: 10,
    cash: 50,
    color: 0x94a3b8,
  },
  {
    rarity: "Rare Remix",
    attendance: 25,
    cash: 150,
    color: 0x60a5fa,
  },
  {
    rarity: "VIP Edit",
    attendance: 60,
    cash: 300,
    color: 0xa855f7,
  },
  {
    rarity: "Legendary ID",
    attendance: 150,
    cash: 1000,
    color: 0xf59e0b,
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const digSteps = [
  {
    description: "You walk into a dusty record shop...",
    progress: "🔎 Searching the bargain bin...",
  },

  {
    description: "You find a stack of old white-label tracks.",
    progress: "💿 Flipping through forgotten USBs...",
  },

  {
    description: "You discover an abandoned hard drive.",
    progress: "💾 Recovering old festival sets...",
  },

  {
    description: "A DJ hands you a mystery USB.",
    progress: "🎧 Previewing unreleased IDs...",
  },

  {
    description: "You open a crate marked DO NOT PLAY.",
    progress: "📦 Digging through forbidden edits...",
  },

  {
    description: "You find someone's backup Rekordbox library.",
    progress: "🎚 Restoring playlists...",
  },

  {
    description: "You stumble onto an old afterparty archive.",
    progress: "🪩 Listening for hidden gems...",
  },

  {
    description: "You connect to a dusty CDJ.",
    progress: "💿 Loading tracks...",
  },

  {
    description: "You found a folder named FINAL_FINAL_REAL_FINAL.",
    progress: "👀 Opening suspicious files...",
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function crateDig(interaction) {
  const userId = interaction.user.id;
    const cooldown = checkCooldown(interaction.user.id, "crate", 360);

    if (cooldown) {
      return interaction.reply({
        content: `⏳ You already went crate digging.\nTry again in **${cooldown}**.`,
        ephemeral: true,
      });
    }

  const used = [];

  for (let i = 0; i < 3; i++) {
    let step;

    do {
      step = digSteps[Math.floor(Math.random() * digSteps.length)];
    } while (used.includes(step));

    used.push(step);

    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("🎵 CRATE DIGGING")
      .setDescription(step.description)
      .addFields({
        name: "Progress",
        value: step.progress,
      });

    if (i === 0) {
      await interaction.reply({
        embeds: [embed],
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
      });
    }

    await sleep(1500);
  }

  const pull = rewards[Math.floor(Math.random() * rewards.length)];

  addPendingPayout(userId, "Crate Dig", pull.cash);

  addRole(userId, "Scene Explorer");

  const finalEmbed = new EmbedBuilder()
    .setColor(pull.color)
    .setTitle("🎵 CRATE DIG COMPLETE")
    .setDescription("You found something worth playing out.")
    .addFields(
      {
        name: "🎧 Discovery",
        value: pull.rarity,
      },
      {
        name: "👥 Show Bonus",
        value: `+${pull.attendance} projected attendees`,
        inline: true,
      },
      {
        name: "💵 Found",
        value: `$${money(pull.cash)}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Future shows may benefit from rare finds.",
    });

  return interaction.editReply({
    embeds: [finalEmbed],
  });
}

const streetTeamSteps = [
  {
    description: "You print a stack of flyers at midnight...",
    progress: "🖨️ Cutting flyers for the street team...",
  },
  {
    description: "You hit the sidewalks downtown...",
    progress: "📣 Handing flyers to ravers outside venues...",
  },
  {
    description: "You post the flyer in every group chat you know...",
    progress: "📱 Spamming the scene responsibly...",
  },
  {
    description: "You convince a local DJ to repost the event...",
    progress: "🎧 Building organic hype...",
  },
  {
    description: "You tape flyers to poles before sunrise...",
    progress: "🌆 Covering the city in show posters...",
  },
  {
    description: "You find the perfect crowd outside an afters...",
    progress: "🪩 Recruiting people for the dancefloor...",
  },
];

const streetTeamRewards = [
  {
    result: "Small buzz",
    cash: 75,
    xp: 10,
    reputation: 1,
    hype: 15,
    color: 0x94a3b8,
  },
  {
    result: "Solid street push",
    cash: 150,
    xp: 20,
    reputation: 2,
    hype: 35,
    color: 0x60a5fa,
  },
  {
    result: "The flyer made the rounds",
    cash: 300,
    xp: 35,
    reputation: 4,
    hype: 75,
    color: 0xa855f7,
  },
  {
    result: "The whole scene is talking",
    cash: 750,
    xp: 60,
    reputation: 8,
    hype: 150,
    color: 0xf59e0b,
  },
];

async function streetTeam(interaction) {
  const userId = interaction.user.id;
  const cooldown = checkCooldown(interaction.user.id, "street", 1440);

  if (cooldown) {
    return interaction.reply({
      content: `📣 Your crew needs rest.\nTry again in **${cooldown}**.`,
      ephemeral: true,
    });
  }

  const used = [];

  for (let i = 0; i < 3; i++) {
    let step;

    do {
      step =
        streetTeamSteps[Math.floor(Math.random() * streetTeamSteps.length)];
    } while (used.includes(step));

    used.push(step);

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("📣 STREET TEAM")
      .setDescription(step.description)
      .addFields({
        name: "Progress",
        value: step.progress,
      });

    if (i === 0) {
      await interaction.reply({
        embeds: [embed],
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
      });
    }

    await sleep(1500);
  }

  const reward =
    streetTeamRewards[Math.floor(Math.random() * streetTeamRewards.length)];

    addPendingPayout(userId, "Street Team", reward.cash);

  db.prepare(
    `
    UPDATE users
    SET reputation = reputation + ?
    WHERE discord_id = ?
  `,
  ).run(reward.reputation, userId);

  addRole(userId, "Scene Explorer");

  const show = db
    .prepare(
      `
    SELECT id, name, simulated_attendees
    FROM shows
    WHERE owner_id = ?
    AND status = 'upcoming'
    ORDER BY RANDOM()
    LIMIT 1
  `,
    )
    .get(userId);

  if (show) {
    db.prepare(
      `
    UPDATE shows
    SET simulated_attendees = simulated_attendees + ?
    WHERE id = ?
  `,
    ).run(reward.hype, show.id);
  }

  const finalEmbed = new EmbedBuilder()
    .setColor(reward.color)
    .setTitle("📣 STREET TEAM COMPLETE")
    .setDescription("You helped push the scene forward.")
    .addFields(
      {
        name: "🔥 Result",
        value: reward.result,
      },
      {
        name: "💵 Cash",
        value: `+$${money(reward.cash)}`,
        inline: true,
      },
      {
        name: "⭐ Reputation",
        value: `+${reward.reputation}`,
        inline: true,
      },
      {
        name: "📈 Show Boost",
        value: show
          ? `+${reward.hype} projected attendees to **${show.name}**`
          : `+${reward.hype} hype earned, but you have no upcoming shows.`,
        inline: false,
      },
    )
    .setFooter({
      text: "Street team work builds reputation and future show momentum.",
    });

  return interaction.editReply({
    embeds: [finalEmbed],
  });
}

const raveStories = [
  {
    setup:
      "You arrive at Neon Rooftop and the bass is already shaking the stairwell.",
    choices: [
      {
        id: "dancefloor",
        label: "Follow the bass",
        emoji: "🕺",
        result: "You found the main room right as the drop hit.",
        cash: 75,
        xp: 10,
        reputation: 1,
      },
      {
        id: "security",
        label: "Talk to security",
        emoji: "🛂",
        result: "Security respects the confidence and lets you skip the line.",
        cash: 50,
        xp: 15,
        reputation: 2,
      },
      {
        id: "kandi",
        label: "Trade kandi",
        emoji: "🌈",
        result: "You made a new scene friend and earned some local respect.",
        cash: 25,
        xp: 20,
        reputation: 3,
      },
    ],
  },
  {
    setup: "A mystery afterparty address gets posted in the group chat.",
    choices: [
      {
        id: "go",
        label: "Go immediately",
        emoji: "🚗",
        result: "You arrived early and helped set up the decks.",
        cash: 100,
        xp: 15,
        reputation: 2,
      },
      {
        id: "invite",
        label: "Invite friends",
        emoji: "📲",
        result: "You brought the energy and the afters filled up fast.",
        cash: 75,
        xp: 20,
        reputation: 3,
      },
      {
        id: "wait",
        label: "Wait it out",
        emoji: "👀",
        result:
          "Good call. The first address got shut down, but you found the real one.",
        cash: 125,
        xp: 25,
        reputation: 2,
      },
    ],
  },
  {
    setup: "You find a lost USB near the DJ booth.",
    choices: [
      {
        id: "return",
        label: "Return it",
        emoji: "🤝",
        result: "The DJ thanks you and puts you on the guest list next time.",
        cash: 50,
        xp: 20,
        reputation: 4,
      },
      {
        id: "preview",
        label: "Preview it",
        emoji: "🎧",
        result:
          "It was full of unreleased IDs. You learned something dangerous.",
        cash: 150,
        xp: 15,
        reputation: 1,
      },
      {
        id: "ask",
        label: "Ask around",
        emoji: "🔎",
        result: "You connected with half the lineup trying to find the owner.",
        cash: 75,
        xp: 25,
        reputation: 3,
      },
    ],
  },
];

async function raveStory(interaction) {
  const story = raveStories[Math.floor(Math.random() * raveStories.length)];
  const userId = interaction.user.id;
  const cooldown = checkCooldown(interaction.user.id, "story", 720);

  if (cooldown) {
    return interaction.reply({
      content: `🪩 You already lived a story tonight.\nTry again in **${cooldown}**.`,
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xff00cc)
    .setTitle("🪩 RAVE STORY")
    .setDescription(story.setup)
    .addFields({
      name: "Choose your move",
      value: "Pick how you want to play this.",
    })
    .setFooter({
      text: "Your choice decides the outcome.",
    });

  const row = new ActionRowBuilder().addComponents(
    story.choices.map((choice) =>
      new ButtonBuilder()
        .setCustomId(`rave_story_${choice.id}`)
        .setLabel(choice.label)
        .setEmoji(choice.emoji)
        .setStyle(ButtonStyle.Primary),
    ),
  );

  activeRaveStories.set(interaction.user.id, story);

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

const activeRaveStories = new Map();

async function handleRaveStoryChoice(interaction) {
  const userId = interaction.user.id;
  const story = activeRaveStories.get(userId);

  if (!story) {
    return interaction.reply({
      content: "That rave story expired. Run `/rave_story` again.",
      ephemeral: true,
    });
  }

  const choiceId = interaction.customId.replace("rave_story_", "");
  const choice = story.choices.find((c) => c.id === choiceId);

  if (!choice) {
    return interaction.reply({
      content: "That choice no longer exists.",
      ephemeral: true,
    });
  }

  activeRaveStories.delete(userId);

  addPendingPayout(userId, "Rave Story", choice.cash);

  db.prepare(
    `
    UPDATE users
    SET reputation = reputation + ?
    WHERE discord_id = ?
  `,
  ).run(choice.reputation, userId);

  addRole(userId, "Scene Explorer");

  const xpUpdate = addXp(userId, choice.xp);

  await announceLevelUp(interaction, xpUpdate);

  let footer = "Every night in the scene has a story.";

  if (xpUpdate?.leveledUp) {
    footer = "🔥 LEVEL UP — your scene presence is growing.";
  } else if (choice.reputation >= 4) {
    footer = "⭐ People are starting to recognize your name.";
  } else if (choice.reputation >= 2) {
    footer = "🎧 Your reputation in the scene increased.";
  }

  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle("🪩 RAVE STORY COMPLETE")
    .setDescription(choice.result)
    .addFields(
      {
        name: "💵 Cash",
        value: `+$${money(choice.cash)}`,
        inline: true,
      },
      {
        name: "⭐ Reputation",
        value: `+${choice.reputation}`,
        inline: true,
      },
      {
        name: "✨ XP",
        value: `+${choice.xp}`,
        inline: true,
      },
    )
    .setFooter({
      text: footer,
    });

  return interaction.update({
    embeds: [embed],
    components: [],
  });
}
module.exports = {
  crateDig,
  streetTeam,
  raveStory,
  handleRaveStoryChoice,
};
