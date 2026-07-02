const db = require("../db");
const { SHOW_STAFF_ROLES, VENUE_STAFF_ROLES } = require("../constants");
const { addRole } = require("../services/roles");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { venueHourlyIncome } = require("../services/venueEngine");

const { getUser } = require("../services/roles");

async function hireStaff(interaction) {
  const userId = interaction.user.id;

  const showId = interaction.options.getString("show");
  const hiredUser = interaction.options.getUser("user");
  const role = interaction.options.getString("role");
  const pay = interaction.options.getInteger("pay");

  const show = db
    .prepare(
      `
      SELECT
        shows.*,
        venues.name AS venue_name,
        venues.staff_limit
      FROM shows
      JOIN venues
        ON venues.id = shows.venue_id
      WHERE shows.id = ?
        AND shows.owner_id = ?
        AND shows.status = 'upcoming'
    `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only hire staff for your own upcoming shows.",
      ephemeral: true,
    });
  }

  const staffCount = db
    .prepare(
      `
    SELECT COUNT(*) AS count
    FROM show_staff
    WHERE show_id = ?
  `,
    )
    .get(show.id).count;

  const currentStaff = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM show_staff
      WHERE show_id = ?
    `,
    )
    .get(show.id).count;

  if (currentStaff >= show.staff_limit) {
    return interaction.reply({
      content: `This venue only allows ${show.staff_limit} staff members.`,
      ephemeral: true,
    });
  }

  const roleData = SHOW_STAFF_ROLES[role];

  if (pay < roleData.minPay) {
    return interaction.reply({
      content: `${roleData.label} requires minimum pay of $${roleData.minPay}.`,
      ephemeral: true,
    });
  }

  db.prepare(
    `
    INSERT INTO show_staff (
      show_id,
      hired_user_id,
      hired_username,
      role,
      pay,
      status
    )
    VALUES (?, ?, ?, ?, ?, 'assigned')
  `,
  ).run(show.id, hiredUser.id, hiredUser.username, role, pay);

  addRole(hiredUser.id, roleData.label);

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle("👷 STAFF HIRED")
    .setDescription(`**${hiredUser.username}** joined **${show.name}**`)
    .addFields(
      {
        name: "🧰 Position",
        value: roleData.label,
        inline: true,
      },
      {
        name: "💵 Pay",
        value: `$${pay}`,
        inline: true,
      },
      {
        name: "🎟 Show",
        value: show.name,
        inline: true,
      },
      {
        name: "📍 Venue",
        value: show.venue_name,
        inline: true,
      },
      {
        name: "👷 Staffing",
        value: `${staffCount + 1}/${show.staff_limit}`,
        inline: true,
      },
      {
        name: "🚀 Effect",
        value: SHOW_STAFF_ROLES[role]?.description || "Supporting the show.",
      },
    )
    .setFooter({
      text: "Build your team before show day",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`show_lineup_${show.id}`)
      .setLabel("🎧 View Lineup")
      .setStyle(ButtonStyle.Secondary),
  );

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function hireVenueStaff(interaction) {
  const userId = interaction.user.id;
  const venueId = interaction.options.getString("venue");
  const hiredUser = interaction.options.getUser("user");
  const role = interaction.options.getString("role");

  const venue = db
    .prepare(
      `
    SELECT * FROM venues WHERE id = ? AND owner_id = ?
  `,
    )
    .get(venueId, userId);

  if (!venue) {
    return interaction.reply({
      content: "You can only hire staff for your own venues.",
      ephemeral: true,
    });
  }

  const staffCount = db
    .prepare(
      `
    SELECT COUNT(*) AS count FROM venue_staff WHERE venue_id = ? AND status = 'active'
  `,
    )
    .get(venueId).count;

  if (staffCount >= venue.staff_limit) {
    return interaction.reply({
      content: `Your venue only has ${venue.staff_limit} staff slots. Fire someone first!`,
      ephemeral: true,
    });
  }

  const roleData = VENUE_STAFF_ROLES[role];
  if (!roleData) {
    return interaction.reply({
      content: "Invalid role selected.",
      ephemeral: true,
    });
  }

  const user = getUser(userId);
  if (user.cash < roleData.cost) {
    return interaction.reply({
      content: `You need $${roleData.cost} to hire a ${roleData.label}.`,
      ephemeral: true,
    });
  }

  db.prepare(`UPDATE users SET cash = cash - ? WHERE discord_id = ?`).run(
    roleData.cost,
    userId,
  );

  const npcUsername = `NPC ${roleData.label}`;

  db.prepare(
    `
  INSERT INTO venue_staff (venue_id, role, status, username, hired_at)
  VALUES (?, ?, 'active', ?, CURRENT_TIMESTAMP)
`,
  ).run(venueId, role, npcUsername);

  const newIncome = venueHourlyIncome(venueId);
  const oldIncome =
    newIncome - venue.base_passive_income * roleData.incomeBoost;

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("👥 STAFF HIRED PERMANENTLY")
    .setDescription(
      `**${npcUsername}** joined **${venue.name}** as ${roleData.label}`,
    )
    .addFields(
      {
        name: "🧰 Position",
        value: roleData.label,
        inline: true,
      },
      {
        name: "💰 Hiring Cost",
        value: `-$${roleData.cost}`,
        inline: true,
      },
      {
        name: "📈 Income Boost",
        value: `+${Math.round(roleData.incomeBoost * 100)}%`,
        inline: true,
      },
      {
        name: "🏢 Venue",
        value: venue.name,
        inline: true,
      },
      {
        name: "👷 Staff Slots",
        value: `${staffCount + 1}/${venue.staff_limit}`,
        inline: true,
      },
      {
        name: "💡 Effect",
        value: roleData.effect || "Boosts venue performance.",
      },
    )
    .setFooter({ text: "Staff will work automatically every cycle" });

  return interaction.reply({ embeds: [embed] });
}

async function myJobs(interaction) {
  const userId = interaction.user.id;

  const jobs = db
    .prepare(
      `
      SELECT
        show_staff.role,
        show_staff.pay,
        show_staff.status,
        shows.name AS show_name,
        shows.show_date
      FROM show_staff
      JOIN shows
        ON shows.id = show_staff.show_id
      WHERE show_staff.hired_user_id = ?
      ORDER BY shows.show_date ASC
    `,
    )
    .all(userId);

  if (jobs.length === 0) {
    return interaction.reply({
      content: "You have no jobs.",
      ephemeral: true,
    });
  }

  const output = jobs
    .map(
      (job) =>
        `🎛️ **${SHOW_STAFF_ROLES[job.role].label}**\n` +
        `Show: ${job.show_name}\n` +
        `Date: ${job.show_date}\n` +
        `Pay: $${job.pay}\n` +
        `Status: ${job.status}`,
    )
    .join("\n\n");

  return interaction.reply(output);
}

module.exports = {
  hireStaff,
  myJobs,
  hireVenueStaff,
};
