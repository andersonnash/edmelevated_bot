const db = require("../db");

const { getUser, addRole } = require("../services/roles");

const { addDjReputation, calculateDjBookingFee } = require("../services/djs");

const { addXp, announceLevelUp } = require("../services/xp");

const { postSceneFeed } = require("../services/sceneFeed");

const { runShowById } = require("../services/showRunner");

const { settleShowPayouts, getOwnedShow } = require("../services/showPayouts");

const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");
const { showStaffRole } = require("../services/showStaffRules");
const { ownedVenueLabel } = require("../services/venueDisplayRules");
const { automatedTicketSummary } = require("../services/ticketSales");

const {
  getVenueIncome,
  getEquipmentIncome,
  venueCapacity,
} = require("../services/venueEngine");

const {
  calculateProjectedWalkins,
  attendanceBonusPercent,
  generateInitialWalkins,
  ticketPriceDemandLabel,
  applyTicketPriceDemand,
  isProjectedSoldOut,
} = require("../services/showForecast");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  randomShowData,
  todayString,
} = require("../services/generators");

const {
  SHOW_STAFF_VENUE_BOOST_PER_STAFF,
  SHOW_STAFF_VENUE_BOOST_CAP,
  SHOW_GENRES,
  SHOW_CREATION_XP,
  isOwner,
} = require("../constants");

const { isBotAdmin } = require("../constants");

async function createShow(interaction) {
  const userId = interaction.user.id;

  const venueId = interaction.options.getString("venue");
  const genre = interaction.options.getString("genre");
  const ticketPrice = interaction.options.getInteger("ticket_price");
  const customName = interaction.options.getString("name")?.trim();

  const venue = db
    .prepare(
      `
        SELECT *
        FROM venues
        WHERE id = ?
        AND owner_id = ?
      `,
    )
    .get(venueId, userId);

  if (!venue) {
    return interaction.editReply({
      content: "You can only create shows at venues you own.",
      ephemeral: true,
    });
  }

  const venueLabel = ownedVenueLabel(
    db
      .prepare("SELECT id, name, type FROM venues WHERE owner_id = ?")
      .all(userId),
    venue.id,
  );

  const event = randomShowData();
  const showName = customName || event.name;

  const initialWalkins = generateInitialWalkins(venue);
  const baseWalkins = applyTicketPriceDemand(initialWalkins, ticketPrice);

  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins,
    venue,
  });
  const capacity = venueCapacity(venue);

  const created = db
    .prepare(
      `
    INSERT INTO shows (
      owner_id,
      venue_id,
      name,
      genre,
      show_date,
      ticket_price,
      simulated_attendees,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')
  `,
    )
    .run(
      userId,
      venue.id,
      showName,
      genre,
      event.date,
      ticketPrice,
      baseWalkins,
    );

  const showId = created.lastInsertRowid;
  const xpUpdate = addXp(userId, SHOW_CREATION_XP);
  await announceLevelUp(interaction, xpUpdate);

  addRole(userId, "Promoter");

  const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 SHOW CREATED")
    .setDescription(`**${showName}**`)
    .addFields(
      {
        name: "📍 Venue",
        value: venueLabel,
        inline: true,
      },
      {
        name: "🎵 Genre",
        value: SHOW_GENRES[genre],
        inline: true,
      },
      {
        name: "📅 Scheduled Date",
        value: event.date,
        inline: true,
      },
      {
        name: "🎟️ Ticket Price",
        value: `$${ticketPrice}`,
        inline: true,
      },
      {
        name: "👥 Forecast",
        value:
          `Ticket Holders: **0**\n` +
          `Projected Walk-ins: **${projectedWalkins}**\n` +
          `Projected Attendance: **${projectedWalkins} / ${capacity}**\n` +
          `Price Effect: **${ticketPriceDemandLabel(ticketPrice)}**\n` +
          `Venue Boost: **+${attendanceBonusPercent(venue)}%**`,
      },
      {
        name: "🚀 Next Steps",
        value:
          "Use the buttons below to promote the show, view the lineup, or hire show staff.",
      },
    )
    .setFooter({
      text: "Use the buttons below to keep building",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`promote_show_${showId}`)
      .setLabel("📣 Promote")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`show_lineup_${showId}`)
      .setLabel("🎧 Lineup")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`hire_show_${showId}`)
      .setLabel("👷 Hire Show Staff")
      .setStyle(ButtonStyle.Success),
  );

  await postSceneFeed(
    interaction.client,
    process.env.SCENE_FEED_CHANNEL_ID,
    { embeds: [embed] },
    {
      color: 0x8b5cf6,
      title: "🎧 New Show Created",
      description: `**${interaction.user.username}** created **${showName}**`,
      fields: [
        {
          name: "Venue",
          value: venueLabel,
          inline: true,
        },
        {
          name: "Genre",
          value: SHOW_GENRES[genre],
          inline: true,
        },
        {
          name: "Date",
          value: event.date,
          inline: true,
        },
        {
          name: "Tickets",
          value: `$${ticketPrice}`,
          inline: true,
        },
      ],
      footer: "EDMELEVATED Scene Feed",
    },
  );

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function showLineup(interaction, buttonShowId = null) {
  const userId = interaction.user.id;

  const showId = buttonShowId || interaction.options.getString("show");

  const bypassDate = interaction.commandName === "force_run_show";

  const show = db
    .prepare(
      `
      SELECT
        shows.*,
        venues.name AS venue_name
      FROM shows
      JOIN venues
        ON venues.id = shows.venue_id
      WHERE
        shows.id = ?
        AND shows.owner_id = ?
    `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "Show not found.",
      ephemeral: true,
    });
  }

  const lineup = db
    .prepare(
      `
      SELECT *
      FROM show_lineup
      WHERE show_id = ?
      ORDER BY slot_order
    `,
    )
    .all(show.id);

  const staff = db
    .prepare(
      `
      SELECT *
      FROM show_staff
      WHERE show_id = ?
    `,
    )
    .all(show.id);

  const embed = new EmbedBuilder()
    .setColor(0xff00cc)
    .setTitle(`🎧 ${show.name}`)
    .setDescription(`${show.venue_name} • ${SHOW_GENRES[show.genre] || "Mixed"}`);

  embed.addFields({
    name: `🎚️ Lineup (${lineup.length})`,

    value: lineup.length
      ? lineup
          .map(
            (dj) => `${dj.slot_order}. ${dj.dj_username} — ${money(dj.pay)}`,
          )
          .join("\n")
      : "No DJs yet.",
  });

  embed.addFields({
    name: `👷 Staff (${staff.length})`,

    value: staff.length
      ? staff
          .map((s) => {
            const assignment = showStaffRole(s.role);
            return `${assignment.emoji} ${assignment.label} — ${money(s.pay)}`;
          })
          .join("\n")
      : "No staff assigned.",
  });

  embed.addFields({
    name: "📊 Summary",

    value:
      `Genre: ${SHOW_GENRES[show.genre] || "Mixed"}\n` +
      `Ticket Holders: ${getShowCounts(show.id).ticketCount}\n` +
      `Ticket Price: ${money(show.ticket_price)}`,
  });

  embed.setFooter({
    text: "DJ and staff payouts are paid when the owner settles the completed show.",
  });

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({
      embeds: [embed],
    });
  }

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

function getUserShows(userId) {
  return db
    .prepare(
      `
     SELECT
        shows.*,
        venues.name AS venue_name,
        venues.base_capacity,
        venues.staff_limit,
        venues.dj_limit,
        venues.bar_level,
        venues.security_level,
        venues.production_level,
        show_ratings.attendance_score AS rating_attendance,
        show_ratings.profitability_score AS rating_profitability,
        show_ratings.production_score AS rating_production,
        show_ratings.lineup_score AS rating_lineup,
        show_ratings.staffing_score AS rating_staffing,
        show_ratings.overall_score AS rating_overall,
        show_ratings.star_rating AS rating_stars,
        show_ratings.crowd_reaction AS rating_reaction
      FROM shows
      LEFT JOIN venues ON venues.id = shows.venue_id
      LEFT JOIN show_ratings ON show_ratings.show_id = shows.id
      WHERE shows.owner_id = ?
      ORDER BY shows.show_date ASC
    `,
    )
    .all(userId);
}

function getShowStaffBoostPercent(showStaffCount) {
  const rawBoost = showStaffCount * SHOW_STAFF_VENUE_BOOST_PER_STAFF;
  const cappedBoost = Math.min(rawBoost, SHOW_STAFF_VENUE_BOOST_CAP);

  return Math.round(cappedBoost * 100);
}

function getShowCounts(showId) {
  const djs = db
    .prepare("SELECT COUNT(*) AS count FROM show_lineup WHERE show_id = ?")
    .get(showId);

  const staff = db
    .prepare("SELECT COUNT(*) AS count FROM show_staff WHERE show_id = ?")
    .get(showId);

  const tickets = db
    .prepare("SELECT COUNT(*) AS count FROM show_tickets WHERE show_id = ?")
    .get(showId);
  const advanceSales = automatedTicketSummary(showId);
  const unpaidPayouts = db
    .prepare(
      "SELECT COUNT(*) AS count FROM show_payouts WHERE show_id = ? AND paid = 0",
    )
    .get(showId);

  return {
    djCount: djs.count || 0,
    showStaffCount: staff.count || 0,
    ticketCount:
      (tickets.count || 0) + Number(advanceSales.quantity || 0),
    advanceTicketCount: Number(advanceSales.quantity || 0),
    advanceTicketRevenue: Number(advanceSales.revenue || 0),
    unpaidPayoutCount: unpaidPayouts.count || 0,
  };
}

function buildMyShowsSummary(userId) {
  const shows = getUserShows(userId);

  const upcoming = shows.filter((s) => s.status === "upcoming");
  const completed = shows.filter((s) => s.status === "completed");

  const embed = new EmbedBuilder()
    .setColor(0xc084fc)
    .setTitle("🎟 YOUR SHOWS")
    .setDescription("Manage your upcoming and completed events.")
    .addFields(
      {
        name: "🟢 Upcoming",
        value: `${upcoming.length}`,
        inline: true,
      },
      {
        name: "✅ Completed",
        value: `${completed.length}`,
        inline: true,
      },
      {
        name: "📊 Total Shows",
        value: `${shows.length}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Choose a category below.",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("shows_upcoming_0")
      .setLabel("🟢 Upcoming")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(upcoming.length === 0),

    new ButtonBuilder()
      .setCustomId("shows_completed_0")
      .setLabel("✅ Completed")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(completed.length === 0),
  );

  return { embed, row };
}

function buildShowPage(userId, status, page = 0) {
  const shows = getUserShows(userId).filter((s) => s.status === status);

  if (!shows.length) {
    return buildMyShowsSummary(userId);
  }

  const totalPages = shows.length;
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const show = shows[safePage];

  const {
    djCount,
    showStaffCount,
    ticketCount,
    advanceTicketCount,
    advanceTicketRevenue,
    unpaidPayoutCount,
  } = getShowCounts(show.id);
  const showStaffBoostPercent = getShowStaffBoostPercent(showStaffCount);
  const finalCapacity = venueCapacity(show);

  const baseProjectedWalkins = Number(show.simulated_attendees || 0);
  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins: baseProjectedWalkins,
    venue: show,
    ticketCount,
  });
  const attendanceBoostPercent = attendanceBonusPercent(show);
  const projectedAttendance = ticketCount + projectedWalkins;
  const closureEndsAt = show.closed_until
    ? new Date(show.closed_until.replace(" ", "T") + "Z")
    : null;
  const isDelayedByClosure =
    status === "upcoming" &&
    show.show_date <= todayString() &&
    closureEndsAt &&
    closureEndsAt > new Date();

  const title =
    status === "upcoming"
      ? `🟢 UPCOMING SHOW (${safePage + 1}/${totalPages})`
      : `✅ COMPLETED SHOW (${safePage + 1}/${totalPages})`;

  const embed = new EmbedBuilder()
    .setColor(status === "upcoming" ? 0x22c55e : 0xfacc15)
    .setTitle(title)
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "🏟 Venue",
        value: show.venue_name || "Unknown venue",
        inline: true,
      },
      {
        name: "🎵 Genre",
        value: SHOW_GENRES[show.genre] || "Mixed",
        inline: true,
      },
      {
        name: "📅 Scheduled Date",
        value: show.show_date || "No date set",
        inline: true,
      },
      {
        name: "🎟 Ticket Price",
        value:
          `${money(show.ticket_price || 0)}\n` +
          `${ticketPriceDemandLabel(show.ticket_price || 0)}`,
        inline: true,
      },
      {
        name: "🎫 Ticket Holders",
        value:
          `${ticketCount} confirmed\n` +
          `${advanceTicketCount} from advance sales`,
        inline: true,
      },
      {
        name: "🎧 DJs",
        value: `${djCount}/${show.dj_limit || 0}`,
        inline: true,
      },
      {
        name: "👷 Show Staff",
        value:
          status === "upcoming"
            ? `${showStaffCount}/${show.staff_limit || 0} hired\n` +
              `Venue Income Boost: +${showStaffBoostPercent}% until showtime`
            : `${showStaffCount}/${show.staff_limit || 0} hired`,
        inline: true,
      },
    )
    .setFooter({
      text:
        status === "upcoming"
          ? "Build your lineup, hire show staff, and promote before show day."
          : "Use /collect_show to settle this completed show.",
    });

  if (status === "upcoming") {
    embed.addFields(
      {
        name: "🎟 Advance Sales",
        value:
          advanceTicketCount > 0
            ? `${advanceTicketCount} tickets • ${money(advanceTicketRevenue)} confirmed revenue`
            : "No automated advance sales yet.",
      },
      {
        name: "👥 Projected Walk-ins",
        value: `${projectedWalkins}`,
        inline: true,
      },
      {
        name: "🏟 Projected Attendance",
        value: `${projectedAttendance} / ${finalCapacity}`,
        inline: true,
      },
      {
        name: "📈 Attendance Boost",
        value: `+${attendanceBoostPercent}% from venue upgrades`,
        inline: true,
      },
    );
  } else {
    embed.addFields({
      name: "💰 Settlement Status",
      value: unpaidPayoutCount > 0 ? "Ready to Settle" : "Settled",
      inline: true,
    });
  }

  if (isDelayedByClosure) {
    const reopensAt = Math.floor(closureEndsAt.getTime() / 1000);
    embed.addFields({
      name: "⚠️ Show Delayed",
      value:
        `${show.closure_reason || "The venue is temporarily closed."}\n` +
        `Venue reopens <t:${reopensAt}:F> (<t:${reopensAt}:R>). The show will run on the first hourly scheduler cycle after reopening.`,
    });
  }

  if (status === "completed" && show.rating_overall != null) {
    embed.addFields({
      name: "⭐ Saved Show Rating",
      value:
        `**Overall:** ${show.rating_stars}/5 ★ (${show.rating_overall}/100)\n` +
        `Attendance ${show.rating_attendance} • Profit ${show.rating_profitability} • ` +
        `Production ${show.rating_production}\n` +
        `Lineup ${show.rating_lineup} • Staffing ${show.rating_staffing}\n` +
        `*“${show.rating_reaction}”*`,
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`shows_${status}_${safePage - 1}`)
      .setLabel("⬅ Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage === 0),

    new ButtonBuilder()
      .setCustomId("shows_home")
      .setLabel("🏠 Summary")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`shows_${status}_${safePage + 1}`)
      .setLabel("Next ➡")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(safePage === totalPages - 1),
  );

  return { embed, row };
}

async function myShows(interaction) {
  const userId = interaction.user.id;

  const { embed, row } = buildMyShowsSummary(userId);

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function handleShowPage(interaction) {
  const userId = interaction.user.id;

  if (interaction.customId === "shows_home") {
    const { embed, row } = buildMyShowsSummary(userId);

    return interaction.update({
      embeds: [embed],
      components: [row],
    });
  }

  const parts = interaction.customId.split("_");
  const status = parts[1];
  const page = Number(parts[2]);

  const { embed, row } = buildShowPage(userId, status, page);

  return interaction.update({
    embeds: [embed],
    components: [row],
  });
}

function buildRunShowEmbed(result) {
  const {
    show,
    confirmedTicketCount,
    staff,
    lineup,
    adjustedWalkins,
    paidRevenue,
    simulatedRevenue,
    totalAttendance,
    staffCost,
    lineupCost,
    operatingCost,
    bonusRevenue,
    netProfit,
    rating,
    baseReputationGain,
    reputationGain,
    xpUpdate,
  } = result;

  const staffSummary = staff.length
    ? staff
        .map((person) => {
          const assignment = showStaffRole(person.role);
          return (
            `${assignment.emoji} ${person.hired_username} — ` +
            `${assignment.label} — ${money(person.pay)}`
          );
        })
        .join("\n")
    : "None";

  const lineupSummary = lineup.length
    ? lineup.map((dj) => `🎧 ${dj.dj_username} — ${money(dj.pay)}`).join("\n")
    : "No lineup";

  return new EmbedBuilder()
    .setColor(netProfit >= 0 ? 0x00ff88 : 0xff3355)
    .setTitle("🎧 EDMELEVATED SHOW REPORT")
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "📍 Event",
        value:
          `**Venue:** ${show.venue_name}\n` +
          `**Genre:** ${SHOW_GENRES[show.genre] || "Mixed"}`,
      },
      {
        name: "👥 Attendance",
        value:
          `**Ticket Holders:** ${confirmedTicketCount}\n` +
          `**Walk-ins:** ${adjustedWalkins}\n` +
          `**Total:** ${totalAttendance}`,
      },
      {
        name: "💸 Money",
        value:
          `**Ticket Revenue:** ${money(paidRevenue)}\n` +
          `**Walk-in Revenue:** ${money(simulatedRevenue)}\n` +
          `**Upgrade Bonus:** ${money(bonusRevenue)}\n` +
          `**Staff Cost:** -${money(staffCost)}\n` +
          `**Lineup Cost:** -${money(lineupCost)}\n` +
          `**Operating Cost:** -${money(operatingCost)}\n` +
          `**Net Profit:** ${money(netProfit)}`,
      },
      {
        name: "⭐ Show Rating",
        value:
          `**Overall:** ${rating.stars}/5 ★ (${rating.overallScore}/100)\n` +
          `**Attendance:** ${rating.attendance}/100\n` +
          `**Profitability:** ${rating.profitability}/100\n` +
          `**Production:** ${rating.production}/100\n` +
          `**Lineup:** ${rating.lineup}/100\n` +
          `**Staffing:** ${rating.staffing}/100\n\n` +
          `*“${rating.reaction}”*`,
      },
      {
        name: "👷 Staff Payouts",
        value: staff.length
          ? `${staffSummary}\n*Pending settlement*`
          : staffSummary,
      },
      {
        name: "🎧 DJ Payouts",
        value: lineup.length
          ? `${lineupSummary}\n*Pending settlement*`
          : lineupSummary,
      },
      {
        name: "⭐ Rewards",
        value:
          `**XP:** +${xpUpdate.xpGain}${xpUpdate.leveledUp ? ` • Level ${xpUpdate.newLevel}!` : ""}\n` +
          `**Base Scene Reputation:** +${baseReputationGain}\n` +
          `**Rating Bonus:** +${rating.reputationBonus}\n` +
          `**Total Scene Reputation:** +${reputationGain}`,
      },
    )
    .setFooter({
      text: "Use /collect_show to settle this show and distribute payouts",
    });
}

function buildCollectShowRow(showId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`collect_show_${showId}`)
      .setLabel("Settle Show")
      .setStyle(ButtonStyle.Success),
  );
}

async function runShow(interaction) {
  const userId = interaction.user.id;

  if (!isBotAdmin(userId)) {
    return interaction.reply({
      content: "Bot admin only.",
      ephemeral: true,
    });
  }

  const showId = interaction.options?.getString("show");

  const bypassDate = interaction.commandName === "force_run_show";

  const showCheck = db
    .prepare(
      `
      SELECT *
      FROM shows
      WHERE id = ?
        AND owner_id = ?
        AND status = 'upcoming'
      `,
    )
    .get(showId, userId);

  if (!showCheck) {
    return interaction.reply({
      content: "You can only run your own upcoming shows.",
      ephemeral: true,
    });
  }

  if (!bypassDate && showCheck.show_date > todayString()) {
    return interaction.editReply({
      content: `This show is scheduled for ${showCheck.show_date}.`,
      ephemeral: true,
    });
  }

  const result = await runShowById(showId);

  if (!result) {
    return interaction.reply({
      content: "Show could not be run.",
      ephemeral: true,
    });
  }

  await announceLevelUp(interaction, result.xpUpdate);

  const embed = buildRunShowEmbed(result);
  const row = buildCollectShowRow(result.show.show_id);

  const response = {
    embeds: [embed],
    components: [row],
  };
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(response);
  }

  return interaction.reply(response);
}

async function collect(interaction) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  const userId = interaction.user.id;

  try {
    const venueData = getVenueIncome(userId);
    const equipmentData = getEquipmentIncome(userId);
    const passiveTotal = (venueData.total || 0) + (equipmentData.total || 0);

    if (passiveTotal <= 0) {
      return interaction.editReply({
        content: "Nothing to collect yet.",
      });
    }

    const transaction = db.transaction(() => {
      addCash(userId, passiveTotal);

      db.prepare(
        `UPDATE venues SET last_collected_at = datetime('now') WHERE owner_id = ?`,
      ).run(userId);

      db.prepare(
        `UPDATE user_equipment SET last_collected_at = datetime('now') WHERE user_id = ?`,
      ).run(userId);
    });

    transaction();

    return interaction.editReply(`💸 Collected **${money(passiveTotal)}**`);
  } catch (error) {
    console.error("Collection error:", error);
    return interaction.editReply("An error occurred while collecting.");
  }
}

async function collectShow(interaction, buttonShowId = null) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  const userId = interaction.user.id;
  const showId = buttonShowId || Number(interaction.options.getString("show"));

  try {
    const show = getOwnedShow(showId, userId);

    if (!show) {
      return interaction.editReply(
        "I couldn't find a show with that ID that belongs to you.",
      );
    }

    if (show.status !== "completed") {
      return interaction.editReply(
        "That show is not completed yet. You can only settle completed shows.",
      );
    }

    const settlement = settleShowPayouts(showId);

    if (!settlement) {
      return interaction.editReply(
        "There are no unpaid payouts for this show. It may have already been settled.",
      );
    }

    const { djs, staff, ownerTake, totalPaid } = settlement;
    if (ownerTake > 0) {
      addRole(userId, "Profitable Promoter");
    }
    const participantPayouts = [...djs, ...staff].reduce(
      (sum, payout) => sum + payout.amount,
      0,
    );

    const balance =
      db.prepare("SELECT cash FROM users WHERE discord_id = ?").get(userId)
        ?.cash ?? 0;

    const formatPayoutLine = (settlement) => {
      const mention = `<@${settlement.user_id}>`;
      return `• ${mention}: ${money(settlement.amount)}`;
    };

    const djLines = djs.length
      ? djs.map(formatPayoutLine).join("\n")
      : "• None";

    const staffLines = staff.length
      ? staff.map(formatPayoutLine).join("\n")
      : "• None";

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💰 SHOW SETTLED")
      .setDescription(`**${show.name}**\nAll show payouts have been processed.`)
      .addFields(
        {
          name: "🏟️ Owner Result",
          value: `${interaction.user}\n${money(ownerTake)}`,
          inline: false,
        },
        {
          name: "🎧 DJs",
          value: djLines,
          inline: true,
        },
        {
          name: "👥 Staff",
          value: staffLines,
          inline: true,
        },
        {
          name: "📊 Settlement",
          value:
            `**Participant Payouts:** ${money(participantPayouts)}\n` +
            `**Net Settlement:** ${money(totalPaid)}\n` +
            `**Balance:** ${money(balance)}`,
          inline: false,
        },
      )
      .setFooter({
        text: `${show.name} has been settled.`,
      });
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("collectShow error:", error);
    return interaction.editReply(
      "An error occurred while settling this show.",
    );
  }
}

async function promoteShowById(interaction, showId) {
  const userId = interaction.user.id;
  const username = interaction.user.username;

  const show = db
    .prepare(
      `
      SELECT *
      FROM shows
      WHERE id = ?
        AND owner_id = ?
        AND status = 'upcoming'
      `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only promote your own upcoming shows.",
      ephemeral: true,
    });
  }

  const venue = db.prepare("SELECT * FROM venues WHERE id = ?").get(show.venue_id);
  const ticketCount = db
    .prepare("SELECT COUNT(*) AS count FROM show_tickets WHERE show_id = ?")
    .get(show.id).count;
  const advanceSales = automatedTicketSummary(show.id);
  const confirmedTicketCount =
    ticketCount + Number(advanceSales.quantity || 0);
  const baseWalkins = Number(show.simulated_attendees || 0);
  const projectedBeforePromotion = calculateProjectedWalkins({
    baseWalkins,
    venue,
    ticketCount: confirmedTicketCount,
  });

  if (
    isProjectedSoldOut({
      baseWalkins,
      venue,
      ticketCount: confirmedTicketCount,
    })
  ) {
    return interaction.reply({
      content:
        `🎟️ **${show.name}** is already projected to sell out.\n` +
        `Capacity: **${venueCapacity(venue)}** • Tickets: **${confirmedTicketCount}** • ` +
        `Projected walk-ins: **${projectedBeforePromotion}**\n` +
        "No promotion was purchased and no cash was spent.",
      ephemeral: true,
    });
  }

  const promo = {
    text: "posted flyers around downtown",
    cost: 100,
    hype: 15,
  };
  const user = getUser(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  if ((user.cash || 0) < promo.cost) {
    return interaction.reply({
      content:
        `You need **${money(promo.cost)}** for this promotion.\n` +
        `Your cash: **${money(user.cash || 0)}**`,
      ephemeral: true,
    });
  }

  const promoteTransaction = db.transaction(() => {
    db.prepare(
      `
      UPDATE users
      SET cash = cash - ?
      WHERE discord_id = ?
      `,
    ).run(promo.cost, userId);

    db.prepare(
      `
      INSERT INTO show_promotions (
        show_id,
        promoter_id,
        promoter_username,
        promo_text,
        hype_gain
      )
      VALUES (?, ?, ?, ?, ?)
      `,
    ).run(show.id, userId, username, promo.text, promo.hype);

    db.prepare(
      `
      UPDATE shows
      SET simulated_attendees = simulated_attendees + ?
      WHERE id = ?
      `,
    ).run(promo.hype, show.id);
  });

  promoteTransaction();

  const projectedAfterPromotion = calculateProjectedWalkins({
    baseWalkins: baseWalkins + promo.hype,
    venue,
    ticketCount,
  });
  const capacity = venueCapacity(venue);
  const attendanceBeforePromotion = ticketCount + projectedBeforePromotion;
  const attendanceAfterPromotion = ticketCount + projectedAfterPromotion;
  const effectiveAttendanceGain =
    attendanceAfterPromotion - attendanceBeforePromotion;
  const isProjectedSellout = attendanceAfterPromotion >= capacity;

  const xpUpdate = addXp(userId, 25);
  await announceLevelUp(interaction, xpUpdate);

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("📣 SHOW PROMOTED")
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "🎤 Promoter",
        value: username,
        inline: true,
      },
      {
        name: "🔥 Promo Move",
        value: promo.text,
        inline: false,
      },
      {
        name: "📈 Demand Added",
        value: `+${promo.hype}`,
        inline: true,
      },
      {
        name: "👥 Before Promotion",
        value: `${attendanceBeforePromotion} / ${capacity} projected attendance`,
        inline: true,
      },
      {
        name: "🏟 After Promotion",
        value:
          `${attendanceAfterPromotion} / ${capacity} projected attendance` +
          (isProjectedSellout ? "\n**Projected Sellout**" : ""),
        inline: true,
      },
      {
        name: "➕ Effective Attendance Gain",
        value: `+${effectiveAttendanceGain}`,
        inline: true,
      },
      {
        name: "💸 Promo Cost",
        value: money(promo.cost),
        inline: true,
      },
      {
        name: "💰 Remaining Cash",
        value: money((user.cash || 0) - promo.cost),
        inline: true,
      },
    )
    .setFooter({
      text:
        effectiveAttendanceGain < promo.hype
          ? `Promotion added ${promo.hype} demand. Venue capacity limited the attendance forecast to ${capacity}.`
          : `Promotion added ${promo.hype} demand to this show's attendance forecast.`,
    });

  return interaction.reply({
    embeds: [embed],
    ephemeral: interaction.isButton?.() ? true : false,
  });
}

async function promoteShow(interaction) {
  const showId = interaction.options.getString("show");
  return promoteShowById(interaction, showId);
}

module.exports = {
  createShow,
  myShows,
  runShow,
  collect,
  promoteShow,
  promoteShowById,
  showLineup,
  announceLevelUp,
  handleShowPage,
  collectShow,
};
