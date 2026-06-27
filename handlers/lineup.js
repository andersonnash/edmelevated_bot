const db = require("../db");
const { addRole } = require("../services/roles");
const {
  findOrCreateDjProfile,
  calculateDjBookingFee,
} = require("../services/djs");

const { EmbedBuilder } = require("discord.js");


async function addLineup(interaction) {
  const userId = interaction.user.id;
  const showId = interaction.options.getString("show");
  const djUser = interaction.options.getUser("dj");
  const djProfile = findOrCreateDjProfile(djUser);
  const pay = calculateDjBookingFee(djProfile);

  const show = db
    .prepare(
      `
      SELECT
        shows.*,
        venues.name AS venue_name,
        venues.dj_limit
      FROM shows
      JOIN venues
        ON venues.id = shows.venue_id
      WHERE
        shows.id = ?
        AND shows.owner_id = ?
        AND shows.status = 'upcoming'
    `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only edit lineups for your own upcoming shows.",
      ephemeral: true,
    });
  }

  const lineupCount = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM show_lineup
      WHERE show_id = ?
    `,
    )
    .get(show.id).count;

  if (lineupCount >= show.dj_limit) {
    return interaction.reply({
      content: `This venue only allows ${show.dj_limit} DJs on the lineup.`,
      ephemeral: true,
    });
  }

  const alreadyBooked = db
    .prepare(
      `
      SELECT *
      FROM show_lineup
      WHERE show_id = ?
        AND dj_user_id = ?
    `,
    )
    .get(show.id, djUser.id);

  if (alreadyBooked) {
    return interaction.reply({
      content: `${djUser.username} is already on this lineup.`,
      ephemeral: true,
    });
  }

  db.prepare(
    `
    INSERT INTO show_lineup (
      show_id,
      dj_user_id,
      dj_username,
      slot_order,
      pay
    )
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(show.id, djUser.id, djUser.username, lineupCount + 1, pay);

  addRole(djUser.id, "Lineup DJ");

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 LINEUP UPDATED")
    .setDescription(`**${djUser.username}** joined **${show.name}**`)
    .addFields(
      {
        name: "🎛️ DJ",
        value: djUser.username,
        inline: true,
      },
      {
        name: "🎚️ Slot",
        value: `${lineupCount + 1}/${show.dj_limit}`,
        inline: true,
      },
      {
        name: "💵 Booking Fee",
        value: `$${pay}`,
        inline: true,
      },
      {
        name: "📍 Venue",
        value: show.venue_name,
        inline: true,
      },
    )
    .setFooter({
      text: "Build your lineup before show day",
    });

    return interaction.reply({
      embeds: [embed],
    });
}

module.exports = {
  addLineup,
};
