const { EmbedBuilder } = require("discord.js");

const db = require("../db");

const {
  calculateDjBookingFee,
  getDjLevel,
  getDjTitle,
} = require("../services/djs");

async function djProfile(interaction) {
  const user = interaction.options.getUser("dj");

  const profile = db
    .prepare(
      `
      SELECT *
      FROM dj_profiles
      WHERE user_id = ?
    `,
    )
    .get(user.id);

  if (!profile) {
    return interaction.reply({
      content:
        "This user does not have a DJ profile yet. Add them to a lineup first.",
      ephemeral: true,
    });
  }

  const level = getDjLevel(profile.dj_reputation);
  const title = getDjTitle(level);
  const bookingFee = calculateDjBookingFee(profile);

  const embed = new EmbedBuilder()
    .setColor(0xff00cc)
    .setTitle(`🎧 ${profile.username}`)
    .setDescription(`**${title}** • DJ Level ${level}`)
    .addFields(
      {
        name: "⭐ DJ Reputation",
        value: `${profile.dj_reputation}`,
        inline: true,
      },
      {
        name: "🎟 Bookings",
        value: `${profile.bookings}`,
        inline: true,
      },
      {
        name: "💵 Booking Fee",
        value: `$${bookingFee}`,
        inline: true,
      },
      {
        name: "📈 How DJ Rep Works",
        value:
          "DJs gain reputation when they play shows.\n" +
          "Higher DJ reputation increases booking fees and status.",
      },
    )
    .setFooter({
      text: "Player roles live in /roles. DJ career lives here.",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

async function topDjs(interaction) {
  const djs = db
    .prepare(
      `
SELECT *
FROM dj_profiles
ORDER BY
dj_reputation DESC
LIMIT 10
`,
    )
    .all();

  const embed = new EmbedBuilder()

    .setColor(0xffd000)

    .setTitle("🏆 TOP DJs");

  djs.forEach((dj, index) =>
    embed.addFields({
      name: `${index + 1}. ${dj.username}`,

      value: `Rep: ${dj.dj_reputation}\nBookings: ${dj.bookings}\nFee: $${calculateDjBookingFee(dj)}`,
    }),
  );

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  djProfile,
  topDjs,
};
