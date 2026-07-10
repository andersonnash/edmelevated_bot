const db = require("../db");
const {
  SHOW_STAFF_ROLES,
  VENUE_STAFF_ROLES,
  SHOW_STAFF_PAYOUT,
  SHOW_STAFF_VENUE_BOOST_PER_STAFF,
  SHOW_STAFF_VENUE_BOOST_CAP,
} = require("../constants");

const { addRole } = require("../services/roles");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  UserSelectMenuBuilder,
} = require("discord.js");

const { getUser } = require("../services/roles");

function getOwnedUpcomingShow(showId, userId) {
  return db
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
}

function getShowStaffCount(showId) {
  return db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM show_staff
      WHERE show_id = ?
      `,
    )
    .get(showId).count;
}

async function hireStaffForShow(interaction, showId, hiredUser) {
  const userId = interaction.user.id;

  const show = getOwnedUpcomingShow(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only hire staff for your own upcoming shows.",
      ephemeral: true,
    });
  }

  if (hiredUser.id === userId) {
    return interaction.reply({
      content: "You cannot hire yourself as show staff.",
      ephemeral: true,
    });
  }

  const staffCount = getShowStaffCount(show.id);

  if (staffCount >= show.staff_limit) {
    return interaction.reply({
      content: `This venue only allows ${show.staff_limit} staff members.`,
      ephemeral: true,
    });
  }

  const alreadyHired = db
    .prepare(
      `
      SELECT id
      FROM show_staff
      WHERE show_id = ?
        AND hired_user_id = ?
      `,
    )
    .get(show.id, hiredUser.id);

  if (alreadyHired) {
    return interaction.reply({
      content: `**${hiredUser.username}** is already hired for this show.`,
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
    VALUES (?, ?, ?, 'staff', ?, 'assigned')
    `,
  ).run(show.id, hiredUser.id, hiredUser.username, SHOW_STAFF_PAYOUT);

  addRole(hiredUser.id, "Show Staff");

  const staffBoostPercent = Math.round(SHOW_STAFF_VENUE_BOOST_PER_STAFF * 100);
  const maxBoostPercent = Math.round(SHOW_STAFF_VENUE_BOOST_CAP * 100);

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle("👷 SHOW STAFF HIRED")
    .setDescription(
      `**${hiredUser.username}** joined **${show.name}** as show staff.`,
    )
    .addFields(
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
        name: "📈 Venue Income Boost",
        value:
          `+${staffBoostPercent}% passive income until this show runs.\n` +
          `Temporary show staff boost caps at +${maxBoostPercent}%.`,
        inline: false,
      },
      {
        name: "💵 Staff Payout",
        value: `${hiredUser.username} will receive **$${SHOW_STAFF_PAYOUT}** when the show runs.`,
        inline: false,
      },
    )
    .setFooter({
      text: "Use /collect before showtime to take advantage of the temporary staff boost.",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`show_lineup_${show.id}`)
      .setLabel("🎧 View Lineup")
      .setStyle(ButtonStyle.Secondary),
  );

  if (interaction.isUserSelectMenu?.()) {
    return interaction.update({
      embeds: [embed],
      components: [row],
    });
  }

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function hireStaff(interaction) {
  const showId = interaction.options.getString("show");
  const hiredUser = interaction.options.getUser("user");

  return hireStaffForShow(interaction, showId, hiredUser);
}

async function handleHireStaffButton(interaction) {
  const userId = interaction.user.id;
  const showId = interaction.customId.replace("hire_show_", "");

  const show = getOwnedUpcomingShow(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only hire staff for your own upcoming shows.",
      ephemeral: true,
    });
  }

  const staffCount = getShowStaffCount(show.id);

  if (staffCount >= show.staff_limit) {
    return interaction.reply({
      content:
        "This venue already has the maximum number of staff for this show.",
      ephemeral: true,
    });
  }

  const staffBoostPercent = Math.round(SHOW_STAFF_VENUE_BOOST_PER_STAFF * 100);
  const maxBoostPercent = Math.round(SHOW_STAFF_VENUE_BOOST_CAP * 100);

  const embed = new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle("👷 Hire Show Staff")
    .setDescription(`Choose a user to hire as show staff for **${show.name}**.`)
    .addFields(
      {
        name: "📍 Venue",
        value: show.venue_name,
        inline: true,
      },
      {
        name: "👷 Staff Slots",
        value: `${staffCount}/${show.staff_limit}`,
        inline: true,
      },
      {
        name: "📈 Temporary Boost",
        value:
          `Each staff member adds **+${staffBoostPercent}%** venue passive income until the show runs.\n` +
          `Show staff boost caps at **+${maxBoostPercent}%**.`,
        inline: false,
      },
      {
        name: "💵 Staff Payout",
        value: `Each staff member gets **$${SHOW_STAFF_PAYOUT}** when the show runs.`,
        inline: false,
      },
    );

  const row = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`hire_staff_user:${show.id}`)
      .setPlaceholder("Choose a user to hire as staff")
      .setMinValues(1)
      .setMaxValues(1),
  );

  return interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

async function handleHireStaffUserSelect(interaction) {
  const showId = interaction.customId.replace("hire_staff_user:", "");
  const selectedUserId = interaction.values[0];

  const selectedUser =
    interaction.users.get(selectedUserId) ||
    (await interaction.client.users.fetch(selectedUserId).catch(() => null));

  if (!selectedUser) {
    return interaction.reply({
      content: "I couldn't find that user.",
      ephemeral: true,
    });
  }

  return hireStaffForShow(interaction, showId, selectedUser);
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
      shows.show_date,
      venues.name AS venue_name
    FROM show_staff
    JOIN shows
      ON shows.id = show_staff.show_id
    JOIN venues
      ON venues.id = shows.venue_id
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

  const statusEmoji = {
    assigned: "👷",
    pending: "⏳",
    accepted: "✅",
    declined: "❌",
    completed: "🏁",
    paid: "💸",
  };

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎛️ My Show Jobs")
    .setDescription("Your upcoming and recent staff gigs in the city.")
    .addFields(
      jobs.slice(0, 25).map((job) => {
        const role = SHOW_STAFF_ROLES[job.role];

        return {
          name: `${role?.emoji || "🎛️"} ${role?.label || job.role}`,
          value:
            `**Show:** ${job.show_name}\n` +
            `**Venue:** ${job.venue_name}\n` +
            `**Date:** ${job.show_date}\n` +
            `**Payout:** $${Number(job.pay || 0).toLocaleString()} when the show runs\n` +
            `**Status:** ${statusEmoji[job.status] || "•"} ${job.status}\n` +
            `**Effect:** Boosting venue passive income until showtime.`,
          inline: false,
        };
      }),
    )
    .setFooter({
      text:
        jobs.length > 25
          ? `Showing 25 of ${jobs.length} jobs`
          : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`,
    });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

module.exports = {
  hireStaff,
  myJobs,
  hireVenueStaff,
  handleHireStaffButton,
  handleHireStaffUserSelect,
};
