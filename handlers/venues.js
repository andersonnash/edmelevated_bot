const db = require("../db");
const { VENUE_TYPES, VENUE_DEPARTMENTS } = require("../constants");
const {
  VENUE_INSURANCE,
  venueInsuranceCost,
  venueDepartmentUpgradeCost,
} = require("../services/venueInvestmentRules");
const { getUser, addRole } = require("../services/roles");

const { money } = require("../services/formatters");
const { isOwner, isBotAdmin } = require("../constants");
const {
  rollVenueEventForOwner,
  buildVenueEventEmbed,
  processVenueEvents,
  forceVenueEventForOwner,
} = require("../services/venueIncidents");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  hoursSince,
  venueHourlyIncome,
  venuePendingIncome,
  venueCapacity,
  getActiveShowStaffBoost,
} = require("../services/venueEngine");

function discordTime(timestamp) {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp.replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return timestamp;
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:F> (<t:${unix}:R>)`;
}

async function venueInsurance(interaction) {
  const userId = interaction.user.id;
  const venueId = interaction.options.getString("venue");

  const user = db
    .prepare(
      `
      SELECT discord_id, cash
      FROM users
      WHERE discord_id = ?
      `,
    )
    .get(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  const venue = db
    .prepare(
      `
      SELECT id, name, type, owner_id, insurance_tier, insurance_expires_at
      FROM venues
      WHERE id = ?
        AND owner_id = ?
      `,
    )
    .get(venueId, userId);

  if (!venue) {
    return interaction.reply({
      content: "I couldn't find that venue, or you do not own it.",
      ephemeral: true,
    });
  }

  const alreadyInsured =
    venue.insurance_expires_at &&
    new Date(venue.insurance_expires_at.replace(" ", "T") + "Z") > new Date();

  if (alreadyInsured) {
    return interaction.reply({
      content:
        `**${venue.name}** already has active insurance.\n` +
        `Coverage expires: ${discordTime(venue.insurance_expires_at)}`,
      ephemeral: true,
    });
  }

  const insuranceCost = venueInsuranceCost(venue.type);

  if ((user.cash || 0) < insuranceCost) {
    return interaction.reply({
      content:
        `You need **${money(insuranceCost)}** for **${VENUE_INSURANCE.name}**.\n` +
        `You currently have **${money(user.cash || 0)}**.`,
      ephemeral: true,
    });
  }

  const expiresAt = db
    .prepare(`SELECT datetime('now', ?) AS expires_at`)
    .get(`+${VENUE_INSURANCE.durationHours} hours`).expires_at;

  const buyInsurance = db.transaction(() => {
    db.prepare(
      `
      UPDATE users
      SET cash = cash - ?
      WHERE discord_id = ?
      `,
    ).run(insuranceCost, userId);

    db.prepare(
      `
      UPDATE venues
      SET insurance_tier = ?,
          insurance_expires_at = ?
      WHERE id = ?
      `,
    ).run(VENUE_INSURANCE.key, expiresAt, venue.id);
  });

  buyInsurance();

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🛡️ VENUE INSURANCE ACTIVE")
    .setDescription(
      `**${venue.name}** is now covered by **${VENUE_INSURANCE.name}**.`,
    )
    .addFields(
      {
        name: "Coverage",
        value:
          "```ansi\n" +
          `Duration:       ${VENUE_INSURANCE.durationHours} hours\n` +
          `Incident Risk:  -${Math.round(VENUE_INSURANCE.incidentReduction * 100)}%\n` +
          `Closure Time:   -${Math.round(VENUE_INSURANCE.closureReduction * 100)}%\n` +
          "```",
      },
      {
        name: "Cost",
        value: money(insuranceCost),
        inline: true,
      },
      {
        name: "Expires",
        value: discordTime(expiresAt),
        inline: true,
      },
    )
    .setFooter({
      text: "Insurance reduces venue incident risk, but does not fully prevent every incident.",
    });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

async function buyVenue(interaction) {
  const userId = interaction.user.id;
  const type = interaction.options.getString("type");
  const venueType = VENUE_TYPES[type];
  if (!venueType) {
    return interaction.reply({
      content: `Unknown venue type: ${type}`,
      ephemeral: true,
    });
  }
  const user = getUser(userId);

  const venueStaffCount = 0;

  if (user.reputation < venueType.repRequired) {
    return interaction.reply({
      content:
        `You need **${venueType.repRequired} Scene Reputation** to buy **${venueType.name}**.\n` +
        `Your current Scene Reputation: **${user.reputation}**`,
      ephemeral: true,
    });
  }

  const maxOwned = venueType.maxOwned ?? Infinity;

  const ownedCount = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM venues
      WHERE owner_id = ?
        AND type = ?
      `,
    )
    .get(userId, type).count;

  if (ownedCount >= maxOwned) {
    return interaction.reply({
      content:
        `You already own the maximum number of **${venueType.name}** venues.\n` +
        `Owned: **${ownedCount}/${maxOwned}**`,
      ephemeral: true,
    });
  }

  if (user.cash < venueType.cost) {
    return interaction.reply({
      content: `You need ${money(venueType.cost)}. You currently have ${money(user.cash)}.`,
      ephemeral: true,
    });
  }

  db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
    venueType.cost,
    userId,
  );

  db.prepare(
    `
  INSERT INTO venues (
    owner_id,
    name,
    type,
    level,
    staff_limit,
    base_capacity,
    dj_limit,
    last_collected_at,
    insurance_tier,
    bar_level,
    security_level,
    production_level,
    created_at
  )
  VALUES (?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP, 'none', 0, 0, 0, CURRENT_TIMESTAMP)
  `,
  ).run(
    userId,
    venueType.name,
    type,
    venueType.staffLimit,
    venueType.baseCapacity,
    venueType.djLimit,
  );

  addRole(userId, "Venue Owner");

  const embed = new EmbedBuilder()
    .setColor(0x00d9ff)
    .setTitle("🏢 VENUE PURCHASED")
    .setDescription(`**${venueType.name}**`)
    .addFields(
      {
        name: "💰 Cost",
        value: money(venueType.cost),
        inline: true,
      },
      {
        name: "🏢 Owned",
        value: `${ownedCount + 1}/${maxOwned}`,
        inline: true,
      },
      {
        name: "💰 Passive Income",
        value: `${money(venueType.passiveIncome)}/hr`,
        inline: true,
      },
      {
        name: "👷 Staff Slots",
        value: `${venueType.staffLimit}`,
        inline: true,
      },
      {
        name: "🎧 DJ Slots",
        value: `${venueType.djLimit}`,
        inline: true,
      },
      {
        name: "🏟️ Capacity",
        value: `${venueType.baseCapacity}`,
        inline: true,
      },
      {
        name: "⭐ Rep Required",
        value: `${venueType.repRequired}`,
        inline: true,
      },
      {
        name: "🚀 Next Step",
        value: "Use `/upgrade_venue` or `/create_show`.",
      },
    )
    .setFooter({
      text: "EDMELEVATED City • Build the scene",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

function getActiveShowStaffCountForVenue(venueId) {
  const row = db
    .prepare(
      `
      SELECT COUNT(show_staff.id) AS count
      FROM show_staff
      JOIN shows
        ON shows.id = show_staff.show_id
      WHERE shows.venue_id = ?
        AND shows.status = 'upcoming'
        AND show_staff.status = 'assigned'
      `,
    )
    .get(venueId);

  return row?.count || 0;
}

function formatInsuranceStatus(venue) {
  if (!venue.insurance_tier || venue.insurance_tier === "none") {
    return null;
  }

  if (!venue.insurance_expires_at) {
    return null;
  }

  const expiresAt = new Date(
    venue.insurance_expires_at.replace(" ", "T") + "Z",
  );

  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    return null;
  }

  const expiresUnix = Math.floor(expiresAt.getTime() / 1000);
  const hoursLeft = Math.ceil((expiresAt - new Date()) / 1000 / 60 / 60);

  return (
    `**${VENUE_INSURANCE.name}**\n` +
    `Expires: <t:${expiresUnix}:R>\n` +
    `Time Left: ~${hoursLeft}h\n` +
    `Incident Risk: -${Math.round(VENUE_INSURANCE.incidentReduction * 100)}%\n` +
    `Closure Time: -${Math.round(VENUE_INSURANCE.closureReduction * 100)}%`
  );
}

function buildVenuePage(userId, page = 0) {
  const venues = db
    .prepare("SELECT * FROM venues WHERE owner_id = ?")
    .all(userId);

  if (!venues.length) {
    return {
      embed: new EmbedBuilder()
        .setColor(0x06b6d4)
        .setTitle("🏟 YOUR VENUE EMPIRE")
        .setDescription("You don’t own any venues yet."),
      row: null,
    };
  }

  function isActiveUntil(timestamp) {
    if (!timestamp) return false;

    return new Date(timestamp.replace(" ", "T") + "Z") > new Date();
  }

  function remainingTime(timestamp) {
    if (!timestamp) return "";

    const end = new Date(timestamp.replace(" ", "T") + "Z");
    const diff = end - new Date();

    if (diff <= 0) return "Expired";

    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
  }

  function venueStatusText(venue) {
    if (isActiveUntil(venue.closed_until)) {
      const title = venue.closure_reason.split(":")[0];

      return `${title}\n❌ Closed • ${remainingTime(venue.closed_until)} remaining`;
    }

    if (isActiveUntil(venue.boosted_until)) {
      return `📈 Income Boost\n🚀 x${venue.income_multiplier} • ${remainingTime(venue.boosted_until)} remaining`;
    }

    return "🟢 Operating Normally";
  }

  const totalHourly = venues.reduce(
    (sum, venue) => sum + venueHourlyIncome(venue),
    0,
  );

  const totalPending = venues.reduce(
    (sum, venue) => sum + venuePendingIncome(venue),
    0,
  );

  const totalPages = venues.length;
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const venue = venues[safePage];
  const hours = hoursSince(venue.created_at);

  const totalMinutes = Math.floor(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const displayTime =
    wholeHours === 0
      ? `${minutes}m`
      : minutes === 0
        ? `${wholeHours}h`
        : `${wholeHours}h ${minutes}m`;

  const venueStaffCount = db
    .prepare(
      `
      SELECT COUNT(*) as count FROM venue_staff 
      WHERE venue_id = ? AND status = 'active'
      `,
    )
    .get(venue.id).count;

  let color = 0x06b6d4;

  if (isActiveUntil(venue.closed_until)) {
    color = 0xef4444;
  } else if (isActiveUntil(venue.boosted_until)) {
    color = 0xf59e0b;
  }

  const insuranceStatus = formatInsuranceStatus(venue);
  const activeShowStaffCount = getActiveShowStaffCountForVenue(venue.id);
  const activeShowStaffBoost = getActiveShowStaffBoost(venue.id);
  const activeShowStaffBoostPercent = Math.round(activeShowStaffBoost * 100);

  const fields = [
    {
      name: "💰 Income",
      value: `${money(venueHourlyIncome(venue))}/hr`,
      inline: true,
    },
    {
      name: "💵 Pending",
      value: money(venuePendingIncome(venue)),
      inline: true,
    },
    {
      name: "🕒 Owned",
      value: displayTime,
      inline: true,
    },
    {
      name: "🏟 Capacity",
      value: `${venueCapacity(venue)}`,
      inline: true,
    },
    {
      name: "👷 Staff Slots",
      value: `${venueStaffCount || 0}/${venue.staff_limit}`,
      inline: true,
    },
    {
      name: "🎧 DJ Slots",
      value: `${venue.dj_limit}`,
      inline: true,
    },
  ];

  if (activeShowStaffCount > 0) {
    fields.push({
      name: "👷 Active Show Staff Boost",
      value:
        `${activeShowStaffCount} staff helping upcoming shows\n` +
        `Income Boost: **+${activeShowStaffBoostPercent}%**\n` +
        "Ends when those shows run.",
      inline: false,
    });
  }

  if (insuranceStatus) {
    fields.push({
      name: "🛡️ Insurance",
      value: insuranceStatus,
      inline: false,
    });
  }

  fields.push({
    name: "📈 Empire Income",
    value:
      `Venues Owned: **${venues.length}**\n` +
      `Total Income: **${money(totalHourly)}/hr**\n` +
      `Total Uncollected: **${money(totalPending)}**`,
    inline: false,
  });

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`🏟 YOUR VENUES (${safePage + 1}/${totalPages})`)
    .setDescription(
      `**${venue.name}** #${venue.id}\n\n**${venueStatusText(venue)}**`,
    )
    .addFields(fields)
    .setFooter({
      text: "Use /collect to collect all passive income.",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`venues_prev_${safePage}`)
      .setLabel("⬅ Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage === 0),

    new ButtonBuilder()
      .setCustomId(`venues_next_${safePage}`)
      .setLabel("Next ➡")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(safePage === totalPages - 1),
  );

  return { embed, row };
}

async function myVenues(interaction) {
  const userId = interaction.user.id;

  const { embed, row } = buildVenuePage(userId, 0);

  return interaction.reply({
    embeds: [embed],
    components: row ? [row] : [],
  });
}

async function handleVenuePage(interaction) {
  const userId = interaction.user.id;
  const parts = interaction.customId.split("_");

  const direction = parts[1];
  const currentPage = Number(parts[2]);

  const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;

  const { embed, row } = buildVenuePage(userId, nextPage);

  return interaction.update({
    embeds: [embed],
    components: row ? [row] : [],
  });
}

async function testVenueEvent(interaction) {
  const userId = interaction.user.id;

  if (!isBotAdmin(userId)) {
    return interaction.reply({
      content: "Bot admin only.",
      ephemeral: true,
    });
  }

  const forcedType = interaction.options.getString("type") || "random";
  const result = forceVenueEventForOwner(userId, forcedType);

  if (!result) {
    return interaction.reply({
      content:
        "No eligible venue found. Venues with active closures or boosts cannot receive another event.",
      ephemeral: true,
    });
  }

  const { venue, type, event } = result;
  const embed = buildVenueEventEmbed(venue, type, event);

  const user = await interaction.client.users.fetch(userId);

  await user.send({
    embeds: [embed],
  });

    return interaction.reply({
    embeds: [embed],
    content: `Forced test venue ${result.type}.`,
    ephemeral: true,
  });
}

async function runVenueEvents(interaction) {
  const userId = interaction.user.id;

  if (!isBotAdmin(userId)) {
    return interaction.reply({
      content: "Bot admin only.",
      ephemeral: true,
    });
  }

  const results = await processVenueEvents(interaction.client);

  if (results.length === 0) {
    return interaction.reply({
      content: "No venue events triggered during this check.",
      ephemeral: true,
    });
  }

  const { venue, type, event } = results[0];
  const embed = buildVenueEventEmbed(venue, type, event);

  return interaction.reply({
    embeds: [embed],
    content: `Processed ${results.length} venue event(s).`,
  });
}

async function upgradeVenue(interaction) {
  const userId = interaction.user.id;
  const venueId = interaction.options.getString("venue");
  const departmentKey = interaction.options.getString("department");

  const department = VENUE_DEPARTMENTS[departmentKey];

  if (!department) {
    return interaction.reply({
      content: "Unknown department.",
      ephemeral: true,
    });
  }

  const venue = db
    .prepare("SELECT * FROM venues WHERE id = ? AND owner_id = ?")
    .get(venueId, userId);

  if (!venue) {
    return interaction.reply({
      content: "You can only upgrade venues you own.",
      ephemeral: true,
    });
  }

  const currentLevel = venue[department.column] || 0;
  const nextLevel = currentLevel + 1;

  const cost = venueDepartmentUpgradeCost(
    venue.type,
    departmentKey,
    nextLevel,
  );
  const currentBenefit = department.benefitPerLevel * currentLevel;
  const nextBenefit = department.benefitPerLevel * nextLevel;

  const user = getUser(userId);

  if (user.cash < cost) {
    return interaction.reply({
      content: `You need ${money(cost)} to upgrade **${department.name}**.`,
      ephemeral: true,
    });
  }

  db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
    cost,
    userId,
  );

  db.prepare(
    `
    UPDATE venues
    SET ${department.column} = ${department.column} + 1
    WHERE id = ?
  `,
  ).run(venue.id);

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🏟 VENUE DEPARTMENT UPGRADED")
    .setDescription(`**${venue.name}**`)
    .addFields(
      {
        name: "Department",
        value: `${department.emoji} ${department.name}`,
        inline: true,
      },
      {
        name: "New Level",
        value: `Lv.${nextLevel}`,
        inline: true,
      },
      {
        name: "Cost",
        value: money(cost),
        inline: true,
      },
      {
        name: "Effect",
        value: department.effect,
      },
      {
        name: "Current Benefit",
        value: `${currentBenefit}%`,
        inline: true,
      },
      {
        name: "New Benefit",
        value: `${nextBenefit}%`,
        inline: true,
      },
      {
        name: "Upgrade Cost",
        value: money(cost),
        inline: true,
      },
    )
    .setFooter({
      text: "Venue departments improve passive income, capacity, and show performance.",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  buyVenue,
  myVenues,
  upgradeVenue,
  handleVenuePage,
  testVenueEvent,
  runVenueEvents,
  venueInsurance,
};
