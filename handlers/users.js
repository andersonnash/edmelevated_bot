const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const db = require("../db");
const { OWNER_ID, ROLES, CAREER_ROLES } = require("../constants");
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

const { VENUE_TYPES, EQUIPMENT_TYPES } = require("../constants");

async function register(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;

  const existing = getUser(userId);

  if (existing) {
    return interaction.reply({
      content: "You’re already registered.",
      ephemeral: true,
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

  return interaction.reply(
    `Welcome to the EDMELEVATED city game, ${username}. You start with $${money(startingCash)}.`,
  );
}

function nextObjective(user, venues, equipment) {
  const cash = user.cash || 0;
  const reputation = user.reputation || 0;

  if (!equipment.length) {
    return (
      "Buy your first DJ controller.\n\n" +
      `Recommended: **Pioneer DDJ-FLX4** (${money(500)})\n` +
      "Why: starts your passive rental income."
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
      (venue.production_level || 0) > 0 ||
      (venue.maintenance_level || 0) > 0,
  );

  if (!hasVenueUpgrade) {
    if (cash < 5000) {
      return (
        "Save for your first venue upgrade.\n\n" +
        `Recommended: **🍺 Bar Lv1** (${money(5000)})\n` +
        `Progress: ${money(cash)} / ${money(5000)}`
      );
    }

    return (
      "Upgrade your venue.\n\n" +
      "Recommended: **🍺 Bar Lv1**\n" +
      "Benefit: +10% passive income and +2% attendance."
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
  const user = getUser(userId);
  const level = user.level || 1;
  const xp = user.xp || 0;
  const bar = xpBar(xp, level);
  const levelTitle = getLevelTitle(level);
  const threshold = Math.pow(level, 2) * 50;
  const venueIncome = getVenueIncome(userId);
  const equipmentIncome = getEquipmentIncome(userId);

  const venues = db
    .prepare("SELECT * FROM venues WHERE owner_id = ?")
    .all(userId);
  const equipment = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ?")
    .all(userId);
  const objective = nextObjective(user, venues, equipment);

  const passiveTotal =
    venues.reduce((sum, venue) => sum + venuePendingIncome(venue), 0) +
    equipment.reduce((sum, item) => sum + equipmentPendingIncome(item), 0);

  const boostPercent =
    venueIncome.baseHourly > 0
      ? Math.round(
          (venueIncome.staffBoostHourly / venueIncome.baseHourly) * 100,
        )
      : 0;

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

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🎧 EDMELEVATED WALLET")
    .setDescription(`**${username}**`)
    .addFields(
      {
        name: "💰 WALLET",
        value:
          "```ansi\n" +
          `Cash:       $${money(user.cash)}\n\n` +
          `LVL ${level} ${bar} ${xp.toLocaleString()} / ${threshold.toLocaleString()} XP\n` +
          `${levelTitle}` +
          "```",
      },
      {
        name: "🏢 PASSIVE INCOME",
        value:
          "```ansi\n" +
          `Venues: ${venues.length} (${money(venueIncome.hourly)}/hr) ${money(venueIncome.staffBoostHourly) > 0 ? "👥" : ""} +${money(venueIncome.total)}\n` +
          `Equipment: ${equipment.length} (${money(equipmentIncome.hourly)}/hr) +${money(equipmentIncome.total)}\n` +
          `Pending Total: ${money(passiveTotal)}\n` +
          "```",
      },
      {
        name: "📊 STATS",
        value:
          "```ansi\n" +
          `Reputation:    ${user.reputation || 0}\n` +
          `Roles:         ${roleEmojis} \n` +
          `Lifetime:      ${money(user.lifetime_earned || 0)}\n` +
          "```",
      },
      {
        name: "🎯 NEXT OBJECTIVE",
        value: objective,
      },
      {
        name: "💡 NEXT STEP",
        value:
          "Use `/work`, `/buy_venue`, `/create_show`, `/promote_show`, or `/collect`.",
      },
    )
    .setFooter({ text: "EDMELEVATED City • Build the scene" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("collect_passive")
      .setLabel("💰 Collect Everything")
      .setStyle(ButtonStyle.Success),
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
        value: `Current Roles: ${currentRoles}\n`
      },
      {
        name: "Role Progression",
        value:`Role Progression: ${progression}\n`
      },
    )
    .setFooter({
      text: "DJ rank lives in /dj_profile. Player achievements live here.",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

async function work(interaction) {
  const userId = interaction.user.id;
  const user = getUser(userId);

  const level = user.level || 1;

  const minEarned = 25 + level * 5;
  const maxEarned = 60 + level * 15;

  const earned =
    Math.floor(Math.random() * (maxEarned - minEarned + 1)) + minEarned;

  addCash(userId, earned);

  const xpUpdate = addXp(userId, 15);
  await announceLevelUp(interaction, xpUpdate);

  return interaction.reply(
    `You passed out flyers downtown and earned **$${earned}** and **15 XP**.`,
  );
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
