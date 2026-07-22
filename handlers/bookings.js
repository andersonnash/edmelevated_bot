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
const { addSceneReputation } = require("../services/reputation");
const { getUser } = require("../services/roles");
const { addXp, announceLevelUp } = require("../services/xp");
const {
  DJ_BOOKINGS,
  DJ_BOOKING_MILESTONES,
  DJ_REPEATABLE_BOOKINGS,
  REPEATABLE_BOOKING_DAILY_LIMIT,
} = require("../constants");
const {
  calculateBookingReward,
  careerMilestoneStatus,
  formatRemainingTime,
  repeatableBookingStatus,
} = require("../services/bookingRules");

const {
  addDjReputation,
  calculateDjBookingFee,
  findOrCreateDjProfile,
  recordCompletedGig,
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

function completedMilestoneCount(userId) {
  return DJ_BOOKING_MILESTONES.filter((booking) =>
    hasCompletedBooking(userId, booking.key),
  ).length;
}

function repeatableRunCount(userId) {
  return db
    .prepare(
      "SELECT COUNT(*) AS count FROM booking_runs WHERE user_id = ? AND booking_kind = 'repeatable'",
    )
    .get(userId).count;
}

function djReputation(userId) {
  return (
    db.prepare("SELECT dj_reputation FROM dj_profiles WHERE user_id = ?").get(userId)
      ?.dj_reputation || 0
  );
}

function milestoneStatus(userId, milestone) {
  const prerequisiteComplete = hasCompletedBooking(
    userId,
    milestone.prerequisite,
  );
  const repeatableRuns = repeatableRunCount(userId);
  const currentDjReputation = djReputation(userId);

  return careerMilestoneStatus({
    milestone,
    prerequisiteComplete,
    repeatableRuns,
    djReputation: currentDjReputation,
  });
}

function isRepeatableUnlocked(userId, booking) {
  return hasCompletedBooking(userId, booking.unlockBooking);
}

function nextMilestone(userId) {
  return DJ_BOOKING_MILESTONES.find(
    (booking) => !hasCompletedBooking(userId, booking.key),
  );
}

function getCareerGenre(userId) {
  return (
    db
      .prepare(
        "SELECT genre FROM user_bookings WHERE user_id = ? AND booking_key = ?",
      )
      .get(userId, OPEN_DECKS_KEY)?.genre || "mixed"
  );
}

function milestoneUnlockText(bookingKey) {
  const unlocks = {
    open_decks_guest_slot: "Community Night and Private Party progression",
    private_party: "Afterparty Set and Local Club Support progression",
    local_club_support: "Club Support Slot and Warehouse Closing progression",
    warehouse_closer: "Underground Genre Showcase",
  };

  return unlocks[bookingKey] || "the next step in your DJ career";
}

function getRepeatableStatus(userId) {
  const lastRun = db
    .prepare(
      `
      SELECT completed_at
      FROM booking_runs
      WHERE user_id = ? AND booking_kind = 'repeatable'
      ORDER BY completed_at DESC, id DESC
      LIMIT 1
      `,
    )
    .get(userId);
  const today = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM booking_runs
      WHERE user_id = ?
        AND booking_kind = 'repeatable'
        AND date(completed_at) = date('now')
      `,
    )
    .get(userId);

  return repeatableBookingStatus({
    lastCompletedAt: lastRun?.completed_at,
    completedToday: today?.count || 0,
    dailyLimit: REPEATABLE_BOOKING_DAILY_LIMIT,
  });
}

function approachRows(kind, bookingKey) {
  const booking =
    kind === "milestone"
      ? DJ_BOOKING_MILESTONES.find((item) => item.key === bookingKey)
      : DJ_REPEATABLE_BOOKINGS.find((item) => item.key === bookingKey);
  const buttons = booking.choices.map((choice, index) =>
    bookingButton(
      `bookings_complete:${kind}:${bookingKey}:${choice.key}`,
      choice.label,
      index === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary,
    ),
  );

  return [new ActionRowBuilder().addComponents(buttons)];
}

function addDemandToNextShow(userId, amount) {
  if (!amount) return null;

  const show = db
    .prepare(
      `
      SELECT id, name
      FROM shows
      WHERE owner_id = ? AND status = 'upcoming'
      ORDER BY show_date ASC, id ASC
      LIMIT 1
      `,
    )
    .get(userId);

  if (!show) return null;

  db.prepare(
    "UPDATE shows SET simulated_attendees = simulated_attendees + ? WHERE id = ?",
  ).run(amount, show.id);
  return show;
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
  const milestone = completed ? nextMilestone(interaction.user.id) : null;
  const milestoneCount = completedMilestoneCount(interaction.user.id);
  const careerProgress = (completed ? 1 : 0) + milestoneCount;
  const currentMilestoneStatus = milestone
    ? milestoneStatus(interaction.user.id, milestone)
    : null;
  const repeatableStatus = getRepeatableStatus(interaction.user.id);
  const repeatableOffers = DJ_REPEATABLE_BOOKINGS.filter(
    (offer) => isRepeatableUnlocked(interaction.user.id, offer),
  );

  const embed = new EmbedBuilder()
    .setColor(0x00d4ff)
    .setTitle("🎧 DJ Bookings")
    .setDescription(
      "Career bookings are completed once. Repeatable gigs can be played again and use a shared cooldown.",
    )
    .addFields({
      name: `🏆 Career Progress — ${careerProgress}/4 Completed`,
      value: !completed
        ? "**ONE-TIME • No cooldown**\n" +
          "Next: **Open Decks Guest Slot**\n" +
          "Requirement: Own any equipment\n" +
          `Completing it unlocks: **${milestoneUnlockText(OPEN_DECKS_KEY)}**`
        : milestone
          ? "**ONE-TIME • No cooldown**\n" +
            `Next: **${milestone.name}**\n` +
            "**Requirements**\n" +
            `${currentMilestoneStatus.prerequisiteComplete ? "✅" : "⬜"} Previous career milestone completed\n` +
            `${currentMilestoneStatus.repeatableRuns >= milestone.repeatableRunsRequired ? "✅" : "⬜"} ` +
            `Repeatable gigs: ${currentMilestoneStatus.repeatableRuns}/${milestone.repeatableRunsRequired}\n` +
            `${currentMilestoneStatus.currentDjReputation >= milestone.djReputationRequired ? "✅" : "⬜"} ` +
            `DJ reputation: ${currentMilestoneStatus.currentDjReputation}/${milestone.djReputationRequired}\n` +
            `First-clear reward: ${money(milestone.cash)}+\n` +
            (currentMilestoneStatus.unlocked
              ? `Completing it unlocks: **${milestoneUnlockText(milestone.key)}**`
              : "Complete repeatable gigs to unlock this career booking.")
          : "✅ All four career milestones completed.",
    });

  if (completed) {
    const repeatableMessage = !repeatableOffers.length
      ? "**Shared rules:** 6-hour cooldown • Maximum 3 per UTC day\n" +
        "Complete **Private Party** to unlock your first repeatable gig."
      : repeatableStatus.available
        ? "**Shared rules:** 6-hour cooldown • Maximum 3 per UTC day\n" +
          repeatableOffers
            .map(
              (offer) =>
                `**${offer.name}** (${genreLabel(getCareerGenre(interaction.user.id))}) • ` +
                `${money(offer.cash)}+ • +${offer.showBonus} next-show demand`,
            )
            .join("\n")
        : repeatableStatus.reason === "daily_limit"
          ? "**Shared rules:** 6-hour cooldown • Maximum 3 per UTC day\n" +
            "You completed all three repeatable gigs for today."
          : "**Shared rules:** 6-hour cooldown • Maximum 3 per UTC day\n" +
            `Next repeatable gig in **${formatRemainingTime(repeatableStatus.remainingMs)}**.`;

    embed.addFields({
      name: "🔁 Repeatable DJ Gigs",
      value: repeatableMessage,
    });
  }

  const rows = [];

  if (!completed) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("bookings_open_decks")
          .setLabel("Career: Open Decks")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasGear),
      ),
    );
  } else if (milestone) {
    rows.push(
      new ActionRowBuilder().addComponents(
        bookingButton(
          `bookings_milestone:${milestone.key}`,
          `Career: ${milestone.name}`,
          ButtonStyle.Success,
        ).setDisabled(!currentMilestoneStatus.unlocked),
      ),
    );
  }

  if (repeatableOffers.length) {
    rows.push(
      new ActionRowBuilder().addComponents(
        repeatableOffers.map((offer) =>
          bookingButton(
            `bookings_repeat:${offer.key}`,
            `Repeatable: ${offer.name}`,
            ButtonStyle.Secondary,
          ).setDisabled(!repeatableStatus.available),
        ),
      ),
    );
  }

  return interaction.reply({
    embeds: [embed],
    components: rows,
    flags: MessageFlags.Ephemeral,
  });
}

async function handleBookingButton(interaction) {
  if (interaction.customId.startsWith("bookings_milestone:")) {
    const bookingKey = interaction.customId.replace("bookings_milestone:", "");
    return showBookingApproaches(interaction, "milestone", bookingKey);
  }

  if (interaction.customId.startsWith("bookings_repeat:")) {
    const bookingKey = interaction.customId.replace("bookings_repeat:", "");
    return showBookingApproaches(interaction, "repeatable", bookingKey);
  }

  if (interaction.customId.startsWith("bookings_complete:")) {
    const [, kind, bookingKey, approachKey] = interaction.customId.split(":");
    return completeCareerBooking(
      interaction,
      kind,
      bookingKey,
      approachKey,
    );
  }

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

async function showBookingApproaches(interaction, kind, bookingKey) {
  const booking =
    kind === "milestone"
      ? DJ_BOOKING_MILESTONES.find((item) => item.key === bookingKey)
      : DJ_REPEATABLE_BOOKINGS.find((item) => item.key === bookingKey);

  if (!booking) {
    return interaction.update({
      content: "That booking is no longer available.",
      embeds: [],
      components: [],
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xff00cc)
    .setTitle(`🎧 ${booking.name}`)
    .setDescription(
      `${booking.scenario}\n\n**What do you do?**`,
    )
    .addFields(
      {
        name: "Booking Type",
        value:
          kind === "milestone"
            ? "One-time career milestone • No repeatable-gig cooldown"
            : "Repeatable DJ gig • Uses the shared 6-hour cooldown and daily limit",
      },
      {
        name: "Base Pay",
        value: money(booking.cash),
        inline: true,
      },
      {
        name: "Next-Show Demand",
        value: `+${booking.showBonus}`,
        inline: true,
      },
    );

  return interaction.update({
    embeds: [embed],
    components: approachRows(kind, bookingKey),
  });
}

async function completeCareerBooking(
  interaction,
  kind,
  bookingKey,
  approachKey,
) {
  const userId = interaction.user.id;
  const booking =
    kind === "milestone"
      ? DJ_BOOKING_MILESTONES.find((item) => item.key === bookingKey)
      : DJ_REPEATABLE_BOOKINGS.find((item) => item.key === bookingKey);
  const approach = booking?.choices.find(
    (choice) => choice.key === approachKey,
  );

  if (!booking || !approach || !ownsAnyEquipment(userId)) {
    return interaction.update({
      content: "That booking is no longer available.",
      embeds: [],
      components: [],
    });
  }

  if (!hasCompletedBooking(userId, OPEN_DECKS_KEY)) {
    return interaction.update({
      content: "Complete Open Decks before taking city bookings.",
      embeds: [],
      components: [],
    });
  }

  if (kind === "milestone") {
    const expected = nextMilestone(userId);
    const status = expected ? milestoneStatus(userId, expected) : null;
    if (!expected || expected.key !== bookingKey || !status.unlocked) {
      return interaction.update({
        content:
          "That career milestone is locked. Complete the listed repeatable gigs and DJ reputation requirements first.",
        embeds: [],
        components: [],
      });
    }
  } else {
    const unlocked = isRepeatableUnlocked(userId, booking);
    const status = getRepeatableStatus(userId);
    if (!unlocked || !status.available) {
      const reason = !unlocked
        ? "That repeatable DJ gig is still locked."
        : status.reason === "daily_limit"
          ? "You already completed three repeatable gigs today."
          : `Your next repeatable gig is available in ${formatRemainingTime(status.remainingMs)}.`;
      return interaction.update({
        content: reason,
        embeds: [],
        components: [],
      });
    }
  }

  const profile = findOrCreateDjProfile(interaction.user);
  const careerGenre = getCareerGenre(userId);
  const bookingGenre =
    booking.genre === "career" ? careerGenre : booking.genre;
  const genreMatch =
    kind === "repeatable" && bookingGenre === careerGenre;
  const reward = calculateBookingReward(
    booking,
    approach,
    profile?.dj_reputation || 0,
    kind === "repeatable",
    genreMatch,
  );
  const genre = bookingGenre || careerGenre;

  const transaction = db.transaction(() => {
    const feeBefore = calculateDjBookingFee(profile);
    addCash(userId, reward.cash);
    addSceneReputation(userId, reward.reputation);
    const xpUpdate = addXp(userId, reward.xp);
    const djUpdate = addDjReputation(userId, reward.djReputation);
    const gigUpdate = recordCompletedGig(userId);
    const feeAfter = calculateDjBookingFee(gigUpdate.profile);

    if (kind === "milestone") {
      db.prepare(
        `
        INSERT INTO user_bookings (
          user_id, booking_key, genre, opener_key, cash_reward, xp_reward,
          reputation_reward, dj_reputation_reward
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
        userId,
        booking.key,
        genre,
        approachKey,
        reward.cash,
        reward.xp,
        reward.reputation,
        reward.djReputation,
      );
    }

    db.prepare(
      `
      INSERT INTO booking_runs (
        user_id, booking_key, booking_kind, genre, approach, cash_reward,
        xp_reward, reputation_reward, dj_reputation_reward, show_bonus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      userId,
      booking.key,
      kind,
      genre,
      approachKey,
      reward.cash,
      reward.xp,
      reward.reputation,
      reward.djReputation,
      reward.showBonus,
    );

    const boostedShow = addDemandToNextShow(userId, reward.showBonus);
    return { feeBefore, feeAfter, xpUpdate, boostedShow };
  });

  const result = transaction();
  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(`🎧 ${booking.name} Complete`)
    .setDescription(approach.result)
    .addFields(
      {
        name: "Rewards",
        value:
          `${money(reward.cash)} cash\n` +
          `+${reward.xp} XP\n` +
          `+${reward.reputation} Scene Reputation\n` +
          `+${reward.djReputation} DJ reputation`,
        inline: true,
      },
      {
        name: "DJ Career",
        value:
          `Booking Fee: ${money(result.feeBefore)} → **${money(result.feeAfter)}**\n` +
          (genreMatch
            ? `Genre Match: **${genreLabel(genre)}** bonus\n`
            : "") +
          (kind === "milestone"
            ? `One-time career milestone completed\nNext unlock: **${milestoneUnlockText(booking.key)}**`
            : "Repeatable DJ gig completed\nNext repeatable gig: **6 hours** (maximum 3 per UTC day)"),
        inline: true,
      },
      {
        name: "Promoter Connection",
        value: result.boostedShow
          ? `+${reward.showBonus} demand added to **${result.boostedShow.name}**.`
          : "Own an upcoming show next time to turn this booking into extra demand.",
      },
    );

  await interaction.update({ embeds: [embed], components: [] });
  await announceLevelUp(interaction, result.xpUpdate);
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

    addSceneReputation(userId, reward.reputation);

    const xpUpdate = addXp(userId, reward.xp);
    const djUpdate = addDjReputation(userId, reward.djReputation);
    const gigUpdate = recordCompletedGig(userId);
    const feeAfter = calculateDjBookingFee(gigUpdate.profile);

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
          `+${reward.reputation} Scene Reputation\n` +
          `+${reward.djReputation} DJ reputation`,
        inline: true,
      },
      {
        name: "DJ Career",
        value:
          `${result.profileCreated ? "DJ Profile Created\n" : ""}` +
          `Completed Gigs: +1\n` +
          `Booking Fee: ${money(result.feeBefore)} → **${money(result.feeAfter)}**`,
        inline: true,
      },
    )
    .setFooter({
      text: "Community Night is now repeatable. Complete it to work toward Private Party.",
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
