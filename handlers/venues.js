const db = require("../db");
const { VENUE_TYPES, VENUE_DEPARTMENTS } = require("../constants");
const { getUser, addRole } = require("../services/roles");

const { money } = require("../services/formatters");

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
  venueReputation,
  venueCapacity,
} = require("../services/venueEngine");

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
        `You need **${venueType.repRequired} reputation** to buy **${venueType.name}**.\n` +
        `Your current reputation: **${user.reputation}**`,
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
    maintenance_level
  )
  VALUES (?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP, 'none', 0, 0, 0, 0)
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
  const hours = hoursSince(venue.last_collected_at);
  const displayTime =
    hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(2)}h`;

  const venueStaffCount = db
    .prepare(
      `
  SELECT COUNT(*) as count FROM venue_staff 
  WHERE venue_id = ? AND status = 'active'
`,
    )
    .get(venue.id).count;

  const embed = new EmbedBuilder()
    .setColor(0x06b6d4)
    .setTitle(`🏟 YOUR VENUES (${safePage + 1}/${totalPages})`)
    .setDescription(`**${venue.name}**`)
    .addFields(
      {
        name: "💰 Income",
        value: `${money(venueHourlyIncome(venue))}/hr`,
        inline: true,
      },
      {
        name: "💵 Uncollected",
        value: money(venuePendingIncome(venue)),
        inline: true,
      },
      {
        name: "🕒 Open For",
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
      {
        name: "⭐ Venue Reputation",
        value: `${venueReputation(venue)}`,
        inline: true,
      },
      {
        name: "📈 Empire Summary",
        value:
          `Venues Owned: **${venues.length}**\n` +
          `Total Income: **${money(totalHourly)}/hr**\n` +
          `Total Uncollected: **${money(totalPending)}**`,
      },
    )
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

  const cost = department.baseCost * nextLevel;
  const currentBenefit = department.benefitPerLevel * currentLevel;
  const nextBenefit = department.benefitPerLevel * nextLevel;
  const repGain = department.reputationPerLevel;

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
        name: "Venue Reputation",
        value: `+${repGain}`,
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
};
