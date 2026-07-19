const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const db = require("../db");

const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");
const { getUser } = require("../services/roles");
const { addXp, announceLevelUp } = require("../services/xp");
const { DJ_BOOKINGS } = require("../constants");

const {
  addDjReputation,
  calculateDjBookingFee,
  findOrCreateDjProfile,
} = require("../services/djs");

const OPEN_DECKS = DJ_BOOKINGS.openDecks;
const OPEN_DECKS_KEY = OPEN_DECKS.key;

function ownsAnyEquipment(userId) {
  const row = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM user_equipment
      WHERE user_id = ?
    `,
    )
    .get(userId);

  return (row?.count || 0) > 0;
}

function hasCompletedBooking(userId, bookingKey) {
  const row = db
    .prepare(
      `
      SELECT *
      FROM user_bookings
      WHERE user_id = ?
      AND booking_key = ?
    `,
    )
    .get(userId, bookingKey);

  return Boolean(row);
}

function bookingButton(customId, label, style = ButtonStyle.Secondary) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style);
}

function openDecksGenreRows() {
  return [
    new ActionRowBuilder().addComponents(
      bookingButton("bookings_genre:house", "House"),
      bookingButton("bookings_genre:dnb", "Drum & Bass"),
      bookingButton("bookings_genre:dubstep", "Dubstep"),
    ),
    new ActionRowBuilder().addComponents(
      bookingButton("bookings_genre:techno", "Techno"),
      bookingButton("bookings_genre:experimental", "Experimental Bass"),
    ),
  ];
}

function openerRows(genre) {
  const options = OPEN_DECKS.genres[genre]?.openers || [];

  const buttons = options.map((option) =>
    bookingButton(`bookings_opener:${genre}:${option.key}`, option.label),
  );

  const rows = [];

  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 2)));
  }

  return rows;
}

function genreLabel(genre) {
  return OPEN_DECKS.genres[genre]?.label || genre;
}

function openerOption(genre, openerKey) {
  return (OPEN_DECKS.genres[genre]?.openers || []).find(
    (option) => option.key === openerKey,
  );
}

function rewardForChoice(genre, openerKey) {
  const option = openerOption(genre, openerKey);

  if (!option) return null;

  const baseReward = OPEN_DECKS.baseReward;

  return {
    cash: baseReward.cash + option.bonus.cash,
    xp: baseReward.xp + option.bonus.xp,
    reputation: baseReward.reputation + option.bonus.reputation,
    djReputation: baseReward.djReputation + option.bonus.djReputation,
    result: option.result,
    openerLabel: option.label,
  };
}

async function bookings(interaction) {
  const user = getUser(interaction.user.id);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so the city knows who you are.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const hasGear = ownsAnyEquipment(interaction.user.id);
  const completed = hasCompletedBooking(interaction.user.id, OPEN_DECKS_KEY);

  const embed = new EmbedBuilder()
    .setColor(0x00d4ff)
    .setTitle("🎧 DJ Bookings")
    .setDescription(
      "Take DJ opportunities around the city to build your reputation, unlock your DJ profile, and raise your booking fee.",
    )
    .addFields(
      {
        name: "Available Booking",
        value:
          "**Open Decks Guest Slot**\n" +
          "Requirement: Own any DJ equipment\n" +
          "Flow: Choose your genre, choose your opening track, play the room.",
      },
      {
        name: "Status",
        value: completed
          ? "You already completed this booking. More bookings are coming soon."
          : hasGear
            ? "You have gear. You can take this booking."
            : "You need to buy equipment first with `/buy_equipment`.",
      },
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bookings_open_decks")
      .setLabel(completed ? "Open Decks Completed" : "Open Decks Guest Slot")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!hasGear || completed),
  );

  return interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleBookingButton(interaction) {
  if (interaction.customId === "bookings_open_decks") {
    if (!ownsAnyEquipment(interaction.user.id)) {
      return interaction.update({
        content: "You need to buy equipment first with `/buy_equipment`.",
        embeds: [],
        components: [],
      });
    }

    if (hasCompletedBooking(interaction.user.id, OPEN_DECKS_KEY)) {
      return interaction.update({
        content: "You already completed the Open Decks Guest Slot.",
        embeds: [],
        components: [],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xff00cc)
      .setTitle("🎧 Open Decks Guest Slot")
      .setDescription(
        "You got a short opening slot at a small local night.\n\n" +
          "The room is filling in. The sound tech gives you a thumbs-up. A few people are watching to see what you do.\n\n" +
          "**What genre are you playing tonight?**",
      );

    return interaction.update({
      embeds: [embed],
      components: openDecksGenreRows(),
    });
  }

  if (interaction.customId.startsWith("bookings_genre:")) {
    const genre = interaction.customId.replace("bookings_genre:", "");

    if (hasCompletedBooking(interaction.user.id, OPEN_DECKS_KEY)) {
      return interaction.update({
        content: "You already completed the Open Decks Guest Slot.",
        embeds: [],
        components: [],
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xff00cc)
      .setTitle("🎧 Open Decks Guest Slot")
      .setDescription(
        `You commit to **${genreLabel(genre)}** for the opening slot.\n\n` +
          "The first track matters. Too safe and nobody remembers you. Too weird and you might clear the room.\n\n" +
          "**What are you opening with?**",
      );

    return interaction.update({
      embeds: [embed],
      components: openerRows(genre),
    });
  }

  if (interaction.customId.startsWith("bookings_opener:")) {
    const [, genre, openerKey] = interaction.customId.split(":");

    return completeOpenDecks(interaction, genre, openerKey);
  }

  return interaction.reply({
    content: "Unknown booking action.",
    flags: MessageFlags.Ephemeral,
  });
}

async function completeOpenDecks(interaction, genre, openerKey) {
  const userId = interaction.user.id;
  const user = getUser(userId);

  if (!user) {
    return interaction.update({
      content: "Run `/profile` first so the city knows who you are.",
      embeds: [],
      components: [],
    });
  }

  if (!ownsAnyEquipment(userId)) {
    return interaction.update({
      content: "You need to buy equipment first with `/buy_equipment`.",
      embeds: [],
      components: [],
    });
  }

  if (hasCompletedBooking(userId, OPEN_DECKS_KEY)) {
    return interaction.update({
      content: "You already completed the Open Decks Guest Slot.",
      embeds: [],
      components: [],
    });
  }

  const reward = rewardForChoice(genre, openerKey);

  if (!reward) {
    return interaction.update({
      content: "That booking choice is no longer available.",
      embeds: [],
      components: [],
    });
  }

  const beforeProfile = db
    .prepare("SELECT * FROM dj_profiles WHERE user_id = ?")
    .get(userId);

  const transaction = db.transaction(() => {
    const profileBefore = findOrCreateDjProfile(interaction.user);
    const feeBefore = calculateDjBookingFee(profileBefore);

    addCash(userId, reward.cash);

    db.prepare(
      `
      UPDATE users
      SET reputation = reputation + ?
      WHERE discord_id = ?
    `,
    ).run(reward.reputation, userId);

    const xpUpdate = addXp(userId, reward.xp);
    const djUpdate = addDjReputation(userId, reward.djReputation);
    const feeAfter = calculateDjBookingFee(djUpdate.profile);

    db.prepare(
      `
      INSERT INTO user_bookings (
        user_id,
        booking_key,
        genre,
        opener_key,
        cash_reward,
        xp_reward,
        reputation_reward,
        dj_reputation_reward
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      userId,
      OPEN_DECKS_KEY,
      genre,
      openerKey,
      reward.cash,
      reward.xp,
      reward.reputation,
      reward.djReputation,
    );

    return {
      profileCreated: !beforeProfile,
      feeBefore,
      feeAfter,
      xpUpdate,
      djUpdate,
    };
  });

  const result = transaction();

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🎧 Open Decks Complete")
    .setDescription(
      `You chose **${genreLabel(genre)}** and opened with **${reward.openerLabel}**.\n\n` +
        `${reward.result}\n\n` +
        "The set is done. The room remembers you a little more than it did before.",
    )
    .addFields(
      {
        name: "Rewards",
        value:
          `${money(reward.cash)} cash\n` +
          `+${reward.xp} XP\n` +
          `+${reward.reputation} scene reputation\n` +
          `+${reward.djReputation} DJ reputation`,
        inline: true,
      },
      {
        name: "DJ Career",
        value:
          `${result.profileCreated ? "DJ Profile Created\n" : ""}` +
          `Bookings: +1\n` +
          `Booking Fee: ${money(result.feeBefore)} → **${money(result.feeAfter)}**`,
        inline: true,
      },
    )
    .setFooter({
      text: "More DJ bookings will unlock later.",
    });

  await interaction.update({
    embeds: [embed],
    components: [],
  });

  await announceLevelUp(interaction, result.xpUpdate);
}

module.exports = {
  bookings,
  handleBookingButton,
};
