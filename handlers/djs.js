const { EmbedBuilder } = require("discord.js");

const db = require("../db");
const { money } = require("../services/formatters");

const {
  calculateDjBookingFee,
  getDjLevel,
  getDjTitle,
  DJ_REPUTATION_FEE_INCREMENT,
  COMPLETED_GIG_FEE_INCREMENT,
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
        "This user does not have a DJ profile yet. They can create one by buying gear and completing a `/bookings` opportunity, or by getting added to a show lineup.",
      ephemeral: true,
    });
  }

  const level = getDjLevel(profile.dj_reputation);
  const title = getDjTitle(level);
  const bookingFee = calculateDjBookingFee(profile);

  const embed = new EmbedBuilder()
    .setColor(0xff00cc)
    .setTitle(`🎧 ${profile.username}'s DJ Profile`)
    .setDescription(`**${title}**\n🎧 DJ Level **${level}**`)
    .addFields(
      {
        name: "⭐ DJ Reputation",
        value: "```ansi\n" + `${profile.dj_reputation}` + "```",
        inline: true,
      },
      {
        name: "🎟 Completed Gigs",
        value: "```ansi\n" + `${profile.bookings}` + "```",
        inline: true,
      },
      {
        name: "💵 Booking Fee",
        value: "```ansi\n" + `${money(bookingFee)}` + "```",
        inline: true,
      },
      {
        name: "📈 How to Grow",
        value:
          "Build DJ reputation through `/bookings` and show lineups.\n" +
          `Each DJ Reputation adds **$${DJ_REPUTATION_FEE_INCREMENT}** and each completed gig adds **$${COMPLETED_GIG_FEE_INCREMENT}** to your booking fee.\n\n` +
          "**Tip:** Buy gear, take bookings, then get added to shows.",
      },
    )
    .setFooter({
      text: "Use /bookings to build your DJ career. Use /roles to view player roles.",
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
      ORDER BY dj_reputation DESC
      LIMIT 10
    `,
    )
    .all();

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🏆 Top DJs")
    .setDescription(
      "Ranked by DJ reputation. Build your career through `/bookings` and show lineups.",
    );

  if (!djs.length) {
    embed.addFields({
      name: "No DJs yet",
      value:
        "Nobody has built a DJ profile yet. Buy gear and complete a `/bookings` opportunity to get started.",
    });
  } else {
    djs.forEach((dj, index) => {
      const level = getDjLevel(dj.dj_reputation);
      const title = getDjTitle(level);
      const bookingFee = calculateDjBookingFee(dj);

      embed.addFields({
        name: `${index + 1}. ${dj.username} — ${title}`,
        value:
          `DJ Level: **${level}**\n` +
          `DJ Reputation: **${dj.dj_reputation}**\n` +
          `Completed Gigs: **${dj.bookings}**\n` +
          `Booking Fee: **${money(bookingFee)}**`,
      });
    });
  }

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  djProfile,
  topDjs,
};
