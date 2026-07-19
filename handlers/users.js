const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const db = require("../db");
const {
  OWNER_ID,
  ROLES,
  CAREER_ROLES,
  VENUE_TYPES,
  EQUIPMENT_TYPES,
  WORK_JOBS,
  SHOP_ITEMS,
  VENUE_DEPARTMENTS,
  DJ_BOOKINGS,
} = require("../constants");

const ALL_ROLES = {
  ...ROLES,
  ...CAREER_ROLES,
};

const { getUser, addRole } = require("../services/roles");
const {
  addXp,
  announceLevelUp,
  xpBar,
  getLevelTitle,
} = require("../services/xp");
const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");
const {
  getVenueIncome,
  getEquipmentIncome,
  equipmentMinuteIncome,
  venuePendingIncome,
  equipmentPendingIncome,
} = require("../services/venueEngine");

const { checkCooldown } = require("../services/cooldowns");

async function register(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;

  const existing = getUser(userId);

  if (existing) {
    const alreadyRegisteredEmbed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("🎧 CITY ACCESS ALREADY ACTIVE")
      .setDescription(
        `**${username}**, you already have an EDMELEVATED City profile.`,
      )
      .addFields(
        {
          name: "🧭 Next Step",
          value: "Use `/profile` to view your city dashboard.",
          inline: false,
        },
        {
          name: "🏙 Current Status",
          value: "Your scene pass is active. Keep building.",
          inline: false,
        },
      )
      .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
      .setFooter({
        text: "EDMELEVATED City • Work jobs. Buy gear. Throw shows. Build the scene.",
      });

    return interaction.reply({
      embeds: [alreadyRegisteredEmbed],
      flags: MessageFlags.Ephemeral,
    });
  }

  const startingCash = userId === OWNER_ID ? 999999999 : 500;

  db.prepare(
    `
    INSERT INTO users (
      discord_id,
      username,
      cash,
      reputation
    )
    VALUES (?, ?, ?, 0)
  `,
  ).run(userId, username, startingCash);

  addRole(userId, "Raver");

  const welcomeEmbed = new EmbedBuilder()
    .setColor(0x22d3ee)
    .setTitle("🎧 EDMELEVATED CITY ACCESS GRANTED")
    .setDescription(
      `Welcome to the city, **${username}**.\n\n` +
        "Your scene profile has been created. You are starting from the ground floor with one goal:\n\n" +
        "**Build the scene.**",
    )
    .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
    .addFields(
      {
        name: "💵 Starter Cash",
        value: `**${money(startingCash)}**`,
        inline: true,
      },
      {
        name: "🌟 Starting Role",
        value: "**Raver**",
        inline: true,
      },
      {
        name: "📍 Reputation",
        value: "**0**",
        inline: true,
      },
      {
        name: "🎯 First Objective",
        value:
          "Buy your first piece of equipment with `/buy_equipment` to start earning passive income.",
        inline: false,
      },
      {
        name: "🧭 Next Step",
        value: "Run `/profile` to view your dashboard and next objective.",
        inline: false,
      },
    )
    .setFooter({
      text: "EDMELEVATED City • Work jobs. Buy gear. Throw shows. Build the scene.",
    });

  return interaction.reply({
    embeds: [welcomeEmbed],
  });
}

function hasCompletedBooking(userId, bookingKey) {
  return !!db
    .prepare(
      `
      SELECT 1
      FROM user_bookings
      WHERE user_id = ?
        AND booking_key = ?
    `,
    )
    .get(userId, bookingKey);
}

function nextObjective(user, venues, equipment, readyToCollect = 0) {
  const cash = user.cash || 0;
  const reputation = user.reputation || 0;
  const completedOpenDecks = hasCompletedBooking(
    user.discord_id,
    DJ_BOOKINGS.openDecks.key,
  );

  if (!equipment.length) {
    return (
      "Buy your first DJ controller.\n\n" +
      `Recommended: **Pioneer DDJ-FLX4** (${money(500)})\n` +
      "Why: starts your passive rental income and unlocks DJ bookings."
    );
  }

  if (!completedOpenDecks) {
    return (
      "Take your first DJ booking.\n\n" +
      "Recommended: **Open Decks Guest Slot**\n" +
      "Why: creates your DJ profile, gives cash/XP/rep, and raises your booking fee.\n\n" +
      "Use `/bookings` to get started."
    );
  }

  if (readyToCollect > 0) {
    return (
      "You have income ready to collect.\n\n" +
      `Ready: **${money(readyToCollect)}**\n` +
      "Claim it, then reinvest into gear, venue staff, or venue upgrades."
    );
  }

  if (!venues.length) {
    if (cash < 2500) {
      return (
        "Save for your first venue.\n\n" +
        `Goal: **Garage Party** (${money(2500)})\n` +
        `Progress: ${money(cash)} / ${money(2500)}`
      );
    }

    return "Buy your first venue with `/buy_venue`.";
  }

  const shows = db
    .prepare("SELECT * FROM shows WHERE owner_id = ?")
    .all(user.discord_id);

  if (!shows.length) {
    return "Create your first show with `/create_show`.";
  }

  const hasVenueUpgrade = venues.some(
    (venue) =>
      (venue.bar_level || 0) > 0 ||
      (venue.security_level || 0) > 0 ||
      (venue.production_level || 0) > 0,
  );

  if (!hasVenueUpgrade) {
    const barUpgrade = VENUE_DEPARTMENTS.bar;
    const barUpgradeCost = barUpgrade.baseCost;
    const barBenefit = barUpgrade.benefitPerLevel;

    if (cash < barUpgradeCost) {
      return (
        "Save for your first venue upgrade.\n\n" +
        `Recommended: **${barUpgrade.emoji} ${barUpgrade.name} Lv1** (${money(barUpgradeCost)})\n` +
        `Progress: ${money(cash)} / ${money(barUpgradeCost)}`
      );
    }

    return (
      "Upgrade your venue.\n\n" +
      `Recommended: **${barUpgrade.emoji} ${barUpgrade.name} Lv1**\n` +
      `Benefit: +${barBenefit}% passive income.`
    );
  }

  if (reputation < 10) {
    return (
      "Reach **10 reputation** to unlock Granary Warehouse.\n\n" +
      `Progress: ${reputation} / 10`
    );
  }

  return "Keep expanding: buy more equipment, upgrade venues, and create bigger shows.";
}

async function profile(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const avatarUrl = interaction.user.displayAvatarURL({
    size: 128,
  });
  const user = getUser(userId);
  const level = user.level || 1;
  const xp = user.xp || 0;
  const bar = xpBar(xp, level);
  const levelTitle = getLevelTitle(level);
  const threshold = Math.pow(level, 2) * 50;
  const venueIncome = getVenueIncome(userId);
  const equipmentIncome = getEquipmentIncome(userId);
  const activeTitle = SHOP_ITEMS[user.active_cosmetic_title];
  const profileColor = activeTitle?.profileColor || 0xffd000;
  const profileEmoji = activeTitle?.profileEmoji || "🎧";
  const profileAccent = activeTitle?.profileAccent || "Build the scene";

  const venues = db
    .prepare("SELECT * FROM venues WHERE owner_id = ?")
    .all(userId);
  const equipment = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ?")
    .all(userId);

  const passiveTotal =
    venues.reduce((sum, venue) => sum + venuePendingIncome(venue), 0) +
    equipment.reduce((sum, item) => sum + equipmentPendingIncome(item), 0);

  const objective = nextObjective(user, venues, equipment, passiveTotal);

  const boostPercent =
    venueIncome.baseHourly > 0
      ? Math.round(
          (venueIncome.staffBoostHourly / venueIncome.baseHourly) * 100,
        )
      : 0;

  const nextStep =
    passiveTotal > 0
      ? "Use /collect to claim your income, then reinvest with /upgrade_venue, /hire_venue_staff, /buy_equipment, or /create_show."
      : "Choose a scene job with /work, upgrade venues, hire venue staff, buy equipment, or create your next show.";

  const pending = db
    .prepare(
      `
    SELECT COALESCE(SUM(profit), 0) AS total
    FROM rave_payouts
    WHERE user_id = ? AND collected = 0
  `,
    )
    .get(userId);

  const roles = db
    .prepare("SELECT role FROM user_roles WHERE user_id = ?")
    .all(userId);
  const rolesList = roles.length
    ? roles.map((r) => `🏆 ${r.role}`).join("  ")
    : "No achievements yet.";

  const roleEmojis = roles.length
    ? roles
        .map((r) => {
          const roleData = Object.values(ALL_ROLES).find(
            (role) => role.name === r.role,
          );

          return roleData?.emoji || "❓";
        })
        .join(" ")
    : "None";

  const profileFields = [
    {
      name: "💰 WALLET",
      value:
        "```ansi\n" +
        `Cash:       ${money(user.cash)}\n\n` +
        `LVL ${level} ${bar} ${xp.toLocaleString()} / ${threshold.toLocaleString()} XP\n` +
        `${levelTitle}` +
        "```",
    },
  ];

  if (activeTitle) {
    profileFields.push({
      name: `${profileEmoji} SCENE TITLE`,
      value:
        "```ansi\n" +
        `Title:      ${activeTitle.name}\n` +
        `Vibe:       ${activeTitle.description}\n` +
        `Theme:      ${profileAccent}` +
        "```",
    });
  }

  profileFields.push(
    {
      name: "🏢 PASSIVE INCOME",
      value:
        "```ansi\n" +
        `Venues: ${venues.length} (${money(venueIncome.hourly)}/hr) ${
          venueIncome.staffBoostHourly > 0 ? "👥" : ""
        } +${money(venueIncome.total)}\n` +
        `Equipment: ${equipment.length} (${money(equipmentIncome.hourly)}/hr) +${money(equipmentIncome.total)}\n` +
        `Ready to Collect: ${money(passiveTotal)}\n` +
        "```",
    },
    {
      name: "📊 STATS",
      value:
        "```ansi\n" +
        `Reputation:    ${user.reputation || 0}\n` +
        `Roles:         ${roleEmojis}\n` +
        `Lifetime:      ${money(user.lifetime_earned || 0)}\n` +
        "```",
    },
    {
      name: "🎯 NEXT OBJECTIVE",
      value: objective,
    },
    {
      name: "💡 NEXT STEP",
      value: nextStep,
    },
  );

  const embed = new EmbedBuilder()
    .setColor(profileColor)
    .setAuthor({
      name: `${username}'s Scene Profile`,
      iconURL: avatarUrl,
    })
    .setTitle(`${profileEmoji} EDMELEVATED CITY`)
    .setDescription("Your progress, income, and next move in the city.")
    .addFields(profileFields)
    .setFooter({
      text: activeTitle
        ? `${activeTitle.name} theme equipped • ${profileAccent}`
        : "EDMELEVATED City • Build the scene",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("collect_passive")
      .setLabel("💰 Collect Everything")
      .setStyle(ButtonStyle.Success)
      .setDisabled(Math.floor(passiveTotal) <= 0),
  );

  return interaction.reply({ embeds: [embed], components: [row] });
}

async function roles(interaction) {
  const userId = interaction.user.id;

  const roles = db
    .prepare("SELECT role FROM user_roles WHERE user_id = ?")
    .all(userId);

  const unlocked = roles.map((r) => r.role);

  const currentRoles = unlocked.length
    ? unlocked.map((role) => `🏆 ${role}`).join("\n")
    : "No roles unlocked yet.";

  const progression = Object.values(ROLES)
    .map((role) => {
      const earned = unlocked.includes(role.name);

      return `${earned ? "✅" : "⬜"} ${role.emoji} ${role.name}\n↳ ${role.unlock}`;
    })
    .join("\n\n");

  const embed = new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle("🏆 EDM ELEVATED ROLES")
    .setDescription("Player achievements and milestone titles.")
    .addFields(
      {
        name: "Unlocked Roles",
        value: `Current Roles: ${currentRoles}\n`,
      },
      {
        name: "Role Progression",
        value: `Role Progression: ${progression}\n`,
      },
    )
    .setFooter({
      text: "DJ rank lives in /dj_profile. Player achievements live here.",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function work(interaction) {
  const userId = interaction.user.id;
  const user = getUser(userId);

  const jobKey = interaction.options.getString("job");
  const job = WORK_JOBS[jobKey];

  if (!job) {
    return interaction.reply({
      content: "That job does not exist.",
      ephemeral: true,
    });
  }

  const level = user.level || 1;

  if (job.minLevel && level < job.minLevel) {
    return interaction.reply({
      content: `${job.emoji} **${job.name}** unlocks at level ${job.minLevel}.`,
      ephemeral: true,
    });
  }

  const cooldown = checkCooldown(userId, `work_${jobKey}`, job.cooldownMinutes);

  if (cooldown) {
    return interaction.reply({
      content: `⏳ You already worked that job.\nTry again in **${cooldown}**.`,
      ephemeral: true,
    });
  }

  const levelBonus = Math.floor(level * 5);
  const earned = roll(job.minCash, job.maxCash) + levelBonus;

  addCash(userId, earned);

  if (job.reputation > 0) {
    db.prepare(
      `
      UPDATE users
      SET reputation = reputation + ?
      WHERE discord_id = ?
      `,
    ).run(job.reputation, userId);
  }

  addRole(userId, "Scene Explorer");

  const xpUpdate = addXp(userId, job.xp);
  await announceLevelUp(interaction, xpUpdate);

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(`${job.emoji} WORK COMPLETE`)
    .setDescription(job.flavor)
    .addFields(
      {
        name: "💵 Cash",
        value: `+${money(earned)}`,
        inline: true,
      },
      {
        name: "✨ XP",
        value: `+${job.xp}`,
        inline: true,
      },
      {
        name: "⭐ Reputation",
        value: `+${job.reputation}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Work is reliable money. Bigger gains come from shows, venues, and equipment.",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

async function leaderboard(interaction) {
  const users = db
    .prepare(
      `
        SELECT username, cash, reputation
        FROM users
        ORDER BY reputation DESC, cash DESC
        LIMIT 10
      `,
    )
    .all();

  const board = users
    .map(
      (u, i) =>
        `${i + 1}. **${u.username}** — Rep: ${u.reputation}, Cash: $${money(u.cash)}`,
    )
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🏆 EDMELEVATED LEADERBOARD")
    .setDescription("Top scene members");

  users.forEach((user, index) => {
    embed.addFields({
      name: `${index + 1}. ${user.username}`,
      value: `**Rep:** ${user.reputation}\n` + `**Cash:** $${money(user.cash)}`,
    });
  });

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  register,
  profile,
  roles,
  work,
  leaderboard,
};
