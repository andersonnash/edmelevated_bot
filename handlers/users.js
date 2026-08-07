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
  WORK_SCENARIOS,
  SHOP_ITEMS,
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
const { addSceneReputation } = require("../services/reputation");
const { buildProfileNextMove } = require("../services/profileNextMove");
const {
  evaluateProgressionAchievements,
} = require("../services/progressionAchievements");
const {
  getVenueIncome,
  getEquipmentIncome,
  equipmentMinuteIncome,
  venuePendingIncome,
  equipmentPendingIncome,
  getInstalledEquipmentEffects,
  venueCapacity,
} = require("../services/venueEngine");
const { calculateProjectedWalkins } = require("../services/showForecast");
const { promotionCampaign } = require("../services/promotionRules");

const { checkCooldown } = require("../services/cooldowns");
const { getPromoterRatingStats } = require("../services/showRatingHistory");
const {
  calculateDjBookingFee,
  getDjLevel,
  getDjTitle,
} = require("../services/djs");
const {
  WORK_COOLDOWN_MINUTES,
  calculateWorkReward,
  selectWorkScenario,
} = require("../services/workRules");

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
        name: "📍 Scene Reputation",
        value: "**0**",
        inline: true,
      },
      {
        name: "🎯 First Objective",
        value:
          "Run `/journey`. It will guide you through buying equipment, entering the scene, and playing your first showcase.",
        inline: false,
      },
      {
        name: "🧭 Next Step",
        value: "Start with `/journey`. Return to `/profile` whenever you need direction.",
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
    .prepare("SELECT * FROM venues WHERE owner_id = ? ORDER BY id ASC")
    .all(userId);
  const equipment = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ?")
    .all(userId);
  const equipmentCount = equipment.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const passiveTotal =
    venues.reduce((sum, venue) => sum + venuePendingIncome(venue), 0) +
    equipment.reduce((sum, item) => sum + equipmentPendingIncome(item), 0);

  const journeyProgress = db
    .prepare(
      "SELECT showcase_completed FROM user_journey_progress WHERE user_id = ?",
    )
    .get(userId);
  const completedOpenDecks = hasCompletedBooking(
    userId,
    DJ_BOOKINGS.openDecks.key,
  );
  const showCount = db
    .prepare("SELECT COUNT(*) AS count FROM shows WHERE owner_id = ?")
    .get(userId).count;
  const completedShow = db
    .prepare(
      `
      SELECT shows.name
      FROM shows
      JOIN show_payouts ON show_payouts.show_id = shows.id
      WHERE shows.owner_id = ?
        AND shows.status = 'completed'
        AND show_payouts.paid = 0
      ORDER BY shows.show_date ASC, shows.id ASC
      LIMIT 1
      `,
    )
    .get(userId);
  const upcomingShowRows = db
    .prepare(
      `
      SELECT
        shows.id,
        shows.name,
        shows.venue_id,
        shows.simulated_attendees,
        shows.promotion_used,
        venues.type,
        venues.base_capacity,
        venues.security_level,
        venues.production_level,
        venues.dj_limit,
        venues.staff_limit,
        (SELECT COUNT(*) FROM show_lineup WHERE show_id = shows.id) AS lineup_count,
        (SELECT COUNT(*) FROM show_staff WHERE show_id = shows.id) AS staff_count,
        (SELECT COUNT(*) FROM show_promotions WHERE show_id = shows.id) AS promotion_count,
        (SELECT COUNT(*) FROM show_tickets WHERE show_id = shows.id) AS player_ticket_count,
        COALESCE((SELECT SUM(quantity) FROM automated_ticket_sales WHERE show_id = shows.id), 0) AS automated_ticket_count
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      WHERE shows.owner_id = ?
        AND shows.status = 'upcoming'
      ORDER BY shows.show_date ASC, shows.id ASC
      `,
    )
    .all(userId);
  const upcomingShows = upcomingShowRows.map((show) => {
    const effects = getInstalledEquipmentEffects(show.venue_id);
    const venue = {
      ...show,
      installed_equipment_attendance_bonus: effects.attendanceBonus,
    };
    const ticketCount =
      Number(show.player_ticket_count || 0) +
      Number(show.automated_ticket_count || 0);
    const projectedWalkins = calculateProjectedWalkins({
      baseWalkins: Number(show.simulated_attendees || 0),
      venue,
      ticketCount,
    });
    const projectedFull =
      ticketCount + projectedWalkins >= venueCapacity(venue);
    const campaign = promotionCampaign(venue);

    return {
      name: show.name,
      lineupCount: show.lineup_count || 0,
      djLimit: show.dj_limit || 0,
      staffCount: show.staff_count || 0,
      staffLimit: show.staff_limit || 0,
      promotionCount: show.promotion_count || 0,
      projectedFull,
      promotionNeeded:
        Number(show.promotion_used || 0) === 0 && !projectedFull,
      promotionCost: campaign.cost,
    };
  });
  const nextMove = buildProfileNextMove({
    cash: user.cash || 0,
    journeyComplete: !!journeyProgress?.showcase_completed,
    hasEquipment: equipment.length > 0,
    openDecksComplete: completedOpenDecks,
    venueCount: venues.length,
    showCount,
    readyToCollect: passiveTotal,
    completedShow,
    upcomingShows,
    firstVenue: venues[0] || null,
  });
  const promoterStats = getPromoterRatingStats(userId);
  const djProfile = db
    .prepare("SELECT * FROM dj_profiles WHERE user_id = ?")
    .get(userId);

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

  if (promoterStats.totalRatedShows > 0) {
    profileFields.push({
      name: "⭐ PROMOTER RECORD",
      value:
        "```ansi\n" +
        `Rated Shows:  ${promoterStats.totalRatedShows}\n` +
        `Average:      ${promoterStats.averageStars}/5 (${promoterStats.averageScore}/100)\n` +
        `Best:         ${promoterStats.bestStars}/5 (${promoterStats.bestScore}/100)\n` +
        `Strong Streak:${String(promoterStats.currentStreak).padStart(3)} (Best: ${promoterStats.bestStreak})\n` +
        `Show Bonus: +${promoterStats.totalReputationBonus} Scene Reputation` +
        "```",
    });
  }

  if (djProfile) {
    const djLevel = getDjLevel(djProfile.dj_reputation);

    profileFields.push({
      name: "🎧 DJ CAREER",
      value:
        "```ansi\n" +
        `${getDjTitle(djLevel)} • DJ Level ${djLevel}\n` +
        `DJ Reputation: ${djProfile.dj_reputation}\n` +
        `Completed Gigs: ${djProfile.bookings}\n` +
        `Booking Fee: ${money(calculateDjBookingFee(djProfile))}` +
        "```\n" +
        "Use `/dj_profile` for full DJ career details.",
    });
  }

  profileFields.push(
    {
      name: "🏢 PASSIVE INCOME",
      value:
        "```ansi\n" +
        `Venues: ${venues.length} (${money(venueIncome.hourly)}/hr)\n` +
        `  Base venues: ${money(venueIncome.baseHourly)}/hr\n` +
        `  🍺 Bar upgrades: +${money(venueIncome.barBoostHourly)}/hr\n` +
        `  👥 Venue staff: +${money(venueIncome.permanentStaffBoostHourly)}/hr\n` +
        `  👷 Show staff: +${money(venueIncome.showStaffBoostHourly)}/hr\n` +
        `  ⚡ Event boosts: +${money(venueIncome.eventBoostHourly)}/hr\n` +
        `  🎛 Installed gear: +${money(venueIncome.equipmentIncome)}/hr\n` +
        `Equipment: ${equipmentCount} (${money(equipmentIncome.hourly)}/hr)\n` +
        `Ready to Collect: ${money(passiveTotal)}\n` +
        "```",
    },
    {
      name: "📊 STATS",
      value:
        "```ansi\n" +
        `Scene Reputation: ${user.reputation || 0}\n` +
        `Roles:         ${roleEmojis}\n` +
        `Lifetime:      ${money(user.lifetime_earned || 0)}\n` +
        "```",
    },
    {
      name: "🎯 NEXT MOVE",
      value: nextMove,
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
  const user = getUser(userId);
  evaluateProgressionAchievements(userId);

  const roles = db
    .prepare("SELECT role FROM user_roles WHERE user_id = ?")
    .all(userId);

  const unlocked = roles.map((r) => r.role);
  const activityStats =
    db
      .prepare("SELECT * FROM user_activity_stats WHERE user_id = ?")
      .get(userId) || {};

  const progressByRole = {
    "Crate Digger": `${activityStats.crate_digs || 0}/10 crate digs`,
    "Street Team": `${activityStats.street_team_runs || 0}/5 street-team runs`,
    "Story Chaser": `${activityStats.rave_stories || 0}/5 rave stories`,
    "Scene Icon": `${user?.reputation || 0}/100 Scene Reputation`,
    "City Legend": `Level ${user?.level || 1}/25`,
  };

  const currentRoles = unlocked.length
    ? unlocked.map((role) => `🏆 ${role}`).join("\n")
    : "No roles unlocked yet.";

  const progression = Object.values(ROLES)
    .map((role) => {
      const earned = unlocked.includes(role.name);

      const progress = progressByRole[role.name];
      return (
        `${earned ? "✅" : "⬜"} ${role.emoji} ${role.name}\n` +
        `↳ ${role.unlock}${progress && !earned ? ` • ${progress}` : ""}`
      );
    })
    .join("\n\n");

  const embed = new EmbedBuilder()
    .setColor(0xfacc15)
    .setTitle("🏆 EDM ELEVATED ROLES")
    .setDescription(
      "Player achievements and milestone titles. XP raises your unlimited player level; " +
        "Scene Reputation measures citywide credibility; DJ Reputation and Completed Gigs grow your DJ career; " +
        "Show Rating measures event quality. Venue Reputation is planned but not yet tracked.",
    )
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function work(interaction) {
  const userId = interaction.user.id;
  const user = getUser(userId);
  const level = user.level || 1;
  const cooldown = checkCooldown(userId, "work", WORK_COOLDOWN_MINUTES);

  if (cooldown) {
    return interaction.reply({
      content: `⏳ You already worked a scene shift.\nYour next shift is available in **${cooldown}**.`,
      ephemeral: true,
    });
  }

  const scenario = selectWorkScenario(WORK_SCENARIOS);
  const reward = calculateWorkReward(scenario, level);

  for (let index = 0; index < scenario.steps.length; index += 1) {
    const progress = `${"▰".repeat(index + 1)}${"▱".repeat(
      scenario.steps.length - index - 1,
    )}`;
    const embed = new EmbedBuilder()
      .setColor(0x38bdf8)
      .setTitle(`${scenario.emoji} ${scenario.name.toUpperCase()}`)
      .setDescription(scenario.steps[index])
      .addFields({ name: "Shift Progress", value: progress });

    if (index === 0) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.editReply({ embeds: [embed] });
    }

    await sleep(1200);
  }

  addCash(userId, reward.cash);

  addSceneReputation(userId, reward.reputation);

  addRole(userId, "Scene Explorer");

  const xpUpdate = addXp(userId, reward.xp);

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(`${scenario.emoji} WORK COMPLETE`)
    .setDescription(scenario.result)
    .addFields(
      {
        name: "💵 Cash",
        value: `+${money(reward.cash)}`,
        inline: true,
      },
      {
        name: "✨ XP",
        value: `+${reward.xp}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Work is reliable money. Bigger gains come from shows, venues, and equipment.",
    });

  await interaction.editReply({
    embeds: [embed],
  });
  await announceLevelUp(interaction, xpUpdate);
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

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🏆 EDMELEVATED LEADERBOARD")
    .setDescription("Top scene members");

  users.forEach((user, index) => {
    embed.addFields({
      name: `${index + 1}. ${user.username}`,
      value:
        `**Scene Reputation:** ${user.reputation}\n` +
        `**Cash:** ${money(user.cash)}`,
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
