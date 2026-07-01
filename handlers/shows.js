const db = require("../db");

const { getUser, addRole } = require("../services/roles");

const { addDjReputation, calculateDjBookingFee } = require("../services/djs");

const { addXp, announceLevelUp } = require("../services/xp");

const { postSceneFeed } = require("../services/sceneFeed");

const { runShowById } = require("../services/showRunner");

const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");

const {
  getVenueIncome,
  getEquipmentIncome,
} = require("../services/venueEngine");

const {
  calculateProjectedWalkins,
  attendanceBonusPercent,
} = require("../services/showForecast");

const {
  venueCapacity,
  venueAttendanceBonus,
} = require("../services/venueEngine");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  randomShowData,
  randomContestName,
  randomShowEvent,
  todayString,
} = require("../services/generators");

const { STAFF_ROLES, isOwner } = require("../constants");

async function createShow(interaction) {
  const userId = interaction.user.id;

  const venueId = interaction.options.getString("venue");

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

  const event = randomShowData();

  const baseWalkins = Math.floor(Math.random() * 31) + 10;

  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins,
    venue,
  });

  const created = db
    .prepare(
      `
    INSERT INTO shows (
      owner_id,
      venue_id,
      name,
      show_date,
      ticket_price,
      simulated_attendees,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'upcoming')
  `,
    )
    .run(
      userId,
      venue.id,
      event.name,
      event.date,
      event.price,
      projectedWalkins,
    );

  const showId = created.lastInsertRowid;
  const xpUpdate = addXp(userId, 40);
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
    .setDescription(`**${event.name}**`)
    .addFields(
      {
        name: "📍 Venue",
        value: venue.name,
        inline: true,
      },
      {
        name: "📅 Date",
        value: event.date,
        inline: true,
      },
      {
        name: "🎟️ Ticket Price",
        value: `$${event.price}`,
        inline: true,
      },
      {
        name: "👥 Forecast",
        value:
          `Projected Walk-ins: **${projectedWalkins}**\n` +
          `Venue Boost: **+${attendanceBonusPercent(venue)}%**`,
      },
      {
        name: "🚀 Next Steps",
        value: "Use `/promote_show`, `/add_lineup`, `/street_team`",
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
      .setLabel("👷 Hire Staff")
      .setStyle(ButtonStyle.Success),
  );

  await postSceneFeed(
    interaction.client,
    process.env.SCENE_FEED_CHANNEL_ID,
    { embeds: [embed] },
    {
      color: 0x8b5cf6,
      title: "🎧 New Show Created",
      description: `**${interaction.user.username}** created **${event.name}**`,
      fields: [
        {
          name: "Venue",
          value: venue.name,
          inline: true,
        },
        {
          name: "Date",
          value: event.date,
          inline: true,
        },
        {
          name: "Tickets",
          value: `$${event.price}`,
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

  const bypassDate =
    interaction.commandName === "force_run_show" ||
    interaction.customId?.startsWith("run_show_");

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
    .setDescription(`${show.venue_name}`);

  embed.addFields({
    name: `🎚️ Lineup (${lineup.length})`,

    value: lineup.length
      ? lineup
          .map((dj) => `${dj.slot_order}. ${dj.dj_username} — $${dj.pay}`)
          .join("\n")
      : "No DJs yet.",
  });

  embed.addFields({
    name: `👷 Staff (${staff.length})`,

    value: staff.length
      ? staff.map((s) => `${s.role} — $${s.pay}`).join("\n")
      : "No staff assigned.",
  });

  embed.addFields({
    name: "📊 Summary",

    value: `Tickets: ${show.tickets_sold}\n` + `Price: $${show.ticket_price}`,
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
        venues.maintenance_level
      FROM shows
      LEFT JOIN venues ON venues.id = shows.venue_id
      WHERE shows.owner_id = ?
      ORDER BY shows.show_date ASC
    `,
    )
    .all(userId);
}

function getShowCounts(showId) {
  const djs = db
    .prepare("SELECT COUNT(*) AS count FROM show_lineup WHERE show_id = ?")
    .get(showId);

  const staff = db
    .prepare("SELECT COUNT(*) AS count FROM show_staff WHERE show_id = ?")
    .get(showId);

  return {
    djCount: djs.count || 0,
    showStaffCount: staff.count || 0,
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

  const { djCount, showStaffCount } = getShowCounts(show.id);
  const finalCapacity = venueCapacity(show);

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
        name: "📅 Date",
        value: show.show_date || "No date set",
        inline: true,
      },
      {
        name: "🎟 Ticket Price",
        value: money(show.ticket_price || 0),
        inline: true,
      },
      {
        name: "🎫 Tickets Sold",
        value: `${show.tickets_sold || 0}`,
        inline: true,
      },
      {
        name: "🎧 DJs",
        value: `${djCount}/${show.dj_limit || 0}`,
        inline: true,
      },
      {
        name: "👷 Show Staff",
        value: `${showStaffCount}/${show.staff_limit || 0}`,
        inline: true,
      },
      {
        name: "🏟 Capacity",
        value: `${finalCapacity}`,
        inline: true,
      },
      {
        name: "👥 Projected Walk-ins",
        value: `${show.simulated_attendees || 0}`,
        inline: true,
      },
      {
        name: "📈 Attendance Boost",
        value: `+${attendanceBonusPercent(show)}% from venue upgrades`,
        inline: true,
      },
    )
    .setFooter({
      text:
        status === "upcoming"
          ? "Build your lineup, hire staff, and promote before show day."
          : "Use /collect to collect completed show payouts.",
    });

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

async function buyTicket(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const showId = interaction.options.getString("show");

  const show = db
    .prepare(
      `
      SELECT shows.*, venues.name AS venue_name
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      WHERE shows.id = ?
      AND shows.status = 'upcoming'
    `,
    )
    .get(showId);

  if (!show) {
    return interaction.editReply({
      content: "That show is not available.",
      ephemeral: true,
    });
  }

  const existing = db
    .prepare("SELECT * FROM show_tickets WHERE show_id = ? AND user_id = ?")
    .get(show.show_id, userId);

  if (existing) {
    return interaction.editReply({
      content: "You already have a ticket to this show.",
      ephemeral: true,
    });
  }

  const buyer = getUser(userId);

  if (buyer.cash < show.ticket_price) {
    return interaction.editReply({
      content: `You need $${show.ticket_price}.`,
      ephemeral: true,
    });
  }

  db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
    show.ticket_price,
    userId,
  );

  db.prepare(
    `
    INSERT INTO show_tickets (
      show_id,
      user_id,
      username,
      price_paid,
      ticket_type
    )
    VALUES (?, ?, ?, ?, 'paid')
  `,
  ).run(show.show_id, userId, username, show.ticket_price);

  db.prepare(
    "UPDATE shows SET tickets_sold = tickets_sold + 1 WHERE id = ?",
  ).run(show.show_id);

  const xpUpdate = addXp(userId, 10);
  await announceLevelUp(interaction, xpUpdate);

  return interaction.reply(
    `${username} bought a ticket to **${show.name}** for $${show.ticket_price}.`,
  );
}

async function runShow(interaction, buttonShowId = null) {
  const userId = interaction.user.id;

  const showId = buttonShowId || interaction.options?.getString("show");

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

  const {
    show,
    event,
    tickets,
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
    reputationGain,
  } = result;

  const staffSummary = staff.length
    ? staff
        .map(
          (person) =>
            `👷 ${person.hired_username} — ${person.role} — $${person.pay}`,
        )
        .join("\n")
    : "None";

  const lineupSummary = lineup.length
    ? lineup.map((dj) => `🎧 ${dj.dj_username} — $${dj.pay}`).join("\n")
    : "No lineup";

  const embed = new EmbedBuilder()
    .setColor(netProfit >= 0 ? 0x00ff88 : 0xff3355)
    .setTitle("🎧 EDMELEVATED SHOW REPORT")
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "📍 Event",
        value:
          `**Venue:** ${show.venue_name}\n` +
          `**Dynamic Event:** ${event.title}`,
      },
      {
        name: "👥 Attendance",
        value:
          `**Real Tickets:** ${tickets.length}\n` +
          `**Walk-ins:** ${adjustedWalkins}\n` +
          `**Total:** ${totalAttendance}`,
      },
      {
        name: "💸 Money",
        value:
          `**Ticket Revenue:** $${paidRevenue}\n` +
          `**Walk-in Revenue:** $${simulatedRevenue}\n` +
          `**Upgrade Bonus:** $${bonusRevenue}\n` +
          `**Staff Cost:** -$${staffCost}\n` +
          `**Lineup Cost:** -$${lineupCost}\n` +
          `**Operating Cost:** -$${operatingCost}\n` +
          `**Net Profit:** $${netProfit}`,
      },
      {
        name: "👷 Staff Earnings",
        value: staffSummary,
      },
      {
        name: "🎧 DJs Earnings",
        value: lineupSummary,
      },
      {
        name: "⭐ Rewards",
        value: `**Reputation:** +${reputationGain}\n`,
      },
    )
    .setFooter({
      text:
        netProfit >= 0
          ? "Use /collect to claim your profit"
          : "You took a loss on this one",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`collect_show_${show.show_id}`)
      .setLabel("💰 Collect Show Profit")
      .setStyle(ButtonStyle.Success),
  );

  const response = {
    embeds: [embed],
    components: netProfit >= 0 ? [row] : [],
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

    return interaction.editReply(`💸 Collected **$${money(passiveTotal)}**`);
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
    const show = db
      .prepare(
        `
        SELECT *
        FROM shows
        WHERE id = ?
          AND owner_id = ?
        `,
      )
      .get(showId, userId);

    if (!show) {
      return interaction.editReply(
        "I couldn't find a show with that ID that belongs to you.",
      );
    }

    if (show.status !== "completed") {
      return interaction.editReply(
        "That show is not completed yet. You can only collect completed shows.",
      );
    }

    const payouts = db
      .prepare(
        `
        SELECT *
        FROM show_payouts
        WHERE show_id = ?
          AND paid = 0
        ORDER BY
          CASE role
            WHEN 'owner' THEN 1
            WHEN 'dj' THEN 2
            WHEN 'staff' THEN 3
            ELSE 4
          END,
          id ASC
        `,
      )
      .all(showId);

    if (!payouts.length) {
      return interaction.editReply(
        "There are no unpaid payouts for this show. It may have already been collected.",
      );
    }

    const ownerPayouts = payouts.filter((p) => p.role === "owner");
    const djPayouts = payouts.filter((p) => p.role === "dj");
    const staffPayouts = payouts.filter((p) => p.role === "staff");

    const ownerTake = ownerPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

    const transaction = db.transaction(() => {
      for (const payout of payouts) {
        addCash(payout.user_id, payout.amount);
      }

      db.prepare(
        `
        UPDATE show_payouts
        SET paid = 1
        WHERE show_id = ?
          AND paid = 0
        `,
      ).run(showId);
    });

    transaction();

    const balance =
      db.prepare("SELECT cash FROM users WHERE discord_id = ?").get(userId)
        ?.cash ?? 0;

    const formatPayoutLine = (payout) => {
      const mention = `<@${payout.user_id}>`;
      return `• ${mention}: ${money(payout.amount)}`;
    };

    const djLines = djPayouts.length
      ? djPayouts.map(formatPayoutLine).join("\n")
      : "• None";

    const staffLines = staffPayouts.length
      ? staffPayouts.map(formatPayoutLine).join("\n")
      : "• None";

    const embed = new EmbedBuilder()
      .setColor(show.status === "completed" ? 0x22c55e : 0xfacc15)
      .setTitle("💰 SHOW PAYDAY!")
      .setDescription(`**${show.name}**\nEveryone has been paid for this show.`)
      .addFields(
        {
          name: "🏟️ Owner",
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
            `**Total Distributed:** ${money(totalPaid)}\n` +
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
      "An error occurred while collecting this show.",
    );
  }
}

async function promoteShow(interaction) {
  const userId = interaction.user.id;

  const username = interaction.user.username;

  const showId = interaction.options.getString("show");

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
    return interaction.editReply({
      content: "You can only promote your upcoming shows.",
      ephemeral: true,
    });
  }

  const promoLines = [
    "posted the flyer everywhere",
    "released a teaser clip",
    "started a Discord campaign",
    "passed out kandi downtown",
    "made the group chat explode",
    "leaked the lineup accidentally",
    "hung posters around the city",
  ];

  const promoText = promoLines[Math.floor(Math.random() * promoLines.length)];

  const promoOptions = [
    {
      text: "posted flyers around downtown",
      cost: 100,
      hype: 15,
    },
    {
      text: "ran an Instagram promo blast",
      cost: 300,
      hype: 40,
    },
    {
      text: "paid a local influencer to post the flyer",
      cost: 1000,
      hype: 125,
    },
    {
      text: "booked a full street-team campaign",
      cost: 2500,
      hype: 300,
    },
  ];

  const promo = promoOptions[Math.floor(Math.random() * promoOptions.length)];

  const user = getUser(userId);

  if (user.cash < promo.cost) {
    return interaction.reply({
      content:
        `You need **$${promo.cost}** for this promotion.\n` +
        `Your cash: ${money(user.cash)}`,
      ephemeral: true,
    });
  }

  db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
    promo.cost,
    userId,
  );

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

  const projectedAfterPromotion = show.simulated_attendees + promo.hype;

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
        name: "📈 Hype Gain",
        value: `+${promo.hype}`,
        inline: true,
      },
      {
        name: "👥 Projected Walk-ins",
        value: `${show.simulated_attendees} → ${projectedAfterPromotion}`,
        inline: true,
      },
      {
        name: "💸 Promo Cost",
        value: `$${promo.cost}`,
        inline: true,
      },
    )
    .setFooter({
      text: "EDMELEVATED City • Promotion matters",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  createShow,
  myShows,
  buyTicket,
  runShow,
  collect,
  promoteShow,
  showLineup,
  announceLevelUp,
  handleShowPage,
  collectShow,
};
