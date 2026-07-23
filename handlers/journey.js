const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const db = require("../db");
const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");
const {
  SHOWCASE_CHOICES,
  getShowcaseChoice,
  journeyRequirements,
  showcaseCashReward,
  showcaseUnlocked,
} = require("../services/journeyRules");
const { addSceneReputation } = require("../services/reputation");
const { addRole } = require("../services/roles");
const { addXp, announceLevelUp } = require("../services/xp");

function getJourneyState(userId) {
  const user = db
    .prepare("SELECT cash FROM users WHERE discord_id = ?")
    .get(userId);
  const equipmentCount = db
    .prepare("SELECT COUNT(*) AS count FROM user_equipment WHERE user_id = ?")
    .get(userId).count;
  const openDecksComplete = !!db
    .prepare(
      "SELECT 1 FROM user_bookings WHERE user_id = ? AND booking_key = 'open_decks_guest_slot'",
    )
    .get(userId);
  const activities =
    db
      .prepare("SELECT * FROM user_activity_stats WHERE user_id = ?")
      .get(userId) || {};
  const progress = db
    .prepare("SELECT * FROM user_journey_progress WHERE user_id = ?")
    .get(userId);

  const input = { equipmentCount, openDecksComplete, activities };
  return {
    user,
    input,
    requirements: journeyRequirements(input),
    unlocked: showcaseUnlocked(input),
    completed: !!progress?.showcase_completed,
    progress,
  };
}

function requirementLine(done, text) {
  return `${done ? "✅" : "⬜"} ${text}`;
}

function showcaseChoiceRow() {
  return new ActionRowBuilder().addComponents(
    ...Object.values(SHOWCASE_CHOICES).map((choice) =>
      new ButtonBuilder()
        .setCustomId(`journey_showcase:${choice.key}`)
        .setLabel(choice.label)
        .setEmoji(choice.emoji)
        .setStyle(ButtonStyle.Primary),
    ),
  );
}

async function journey(interaction) {
  const state = getJourneyState(interaction.user.id);

  if (state.completed) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle("✅ OPENING JOURNEY COMPLETE")
          .setDescription(
            "You turned borrowed decks and a community room into your first real promoter moment.",
          )
          .addFields(
            {
              name: "Borrowed-Venue Showcase",
              value:
                `Score: **${state.progress.showcase_score}/100**\n` +
                `Payout: **${money(state.progress.showcase_cash_reward)}**`,
            },
            {
              name: "Your Next Chapter",
              value:
                "Buy **Garage Party** with `/buy_venue`, then create and prepare your first owned show.",
            },
          ),
      ],
    });
  }

  const { requirements } = state;
  const embed = new EmbedBuilder()
    .setColor(state.unlocked ? 0xfacc15 : 0x38bdf8)
    .setTitle("🧭 YOUR OPENING JOURNEY")
    .setDescription(
      "Build the pieces for a one-time community showcase at a borrowed venue. " +
        "Complete the showcase to earn the backing needed for your first permanent venue.",
    )
    .addFields(
      {
        name: "Journey Progress",
        value: [
          requirementLine(requirements.equipment, "Own your first controller"),
          requirementLine(requirements.openDecks, "Complete Open Decks in `/bookings`"),
          requirementLine(requirements.streetTeam, "Run Street Team once"),
          requirementLine(
            requirements.sceneActivity,
            "Complete a Crate Dig or Rave Story",
          ),
        ].join("\n"),
      },
      {
        name: state.unlocked ? "The Room Is Ready" : "Why These Steps Matter",
        value: state.unlocked
          ? "The community room, crowd, and borrowed gear are ready. Choose how you want to lead the night."
          : "Gear unlocks your DJ path, Open Decks proves you can perform, Street Team finds the crowd, and a scene activity gives the night its personality.",
      },
    );

  return interaction.reply({
    embeds: [embed],
    components: state.unlocked ? [showcaseChoiceRow()] : [],
  });
}

async function handleJourneyButton(interaction) {
  const [, choiceKey] = interaction.customId.split(":");
  const choice = getShowcaseChoice(choiceKey);
  const userId = interaction.user.id;

  if (!choice) {
    return interaction.reply({ content: "That showcase choice is unavailable.", ephemeral: true });
  }

  const state = getJourneyState(userId);
  if (state.completed) {
    return interaction.update({
      content: "Your borrowed-venue showcase is already complete.",
      embeds: [],
      components: [],
    });
  }
  if (!state.unlocked) {
    return interaction.update({
      content: "Complete every opening Journey requirement first.",
      embeds: [],
      components: [],
    });
  }

  const cashReward = showcaseCashReward(state.user.cash);
  let xpUpdate;
  const completeShowcase = db.transaction(() => {
    const inserted = db
      .prepare(
        `INSERT OR IGNORE INTO user_journey_progress (
          user_id, showcase_completed, showcase_choice, showcase_score,
          showcase_cash_reward, completed_at
        ) VALUES (?, 1, ?, ?, ?, CURRENT_TIMESTAMP)`,
      )
      .run(userId, choice.key, choice.score, cashReward);

    if (!inserted.changes) return false;

    addCash(userId, cashReward);
    addSceneReputation(userId, choice.sceneReputation);
    xpUpdate = addXp(userId, choice.xp);
    addRole(userId, "Promoter");
    return true;
  });

  if (!completeShowcase()) {
    return interaction.update({
      content: "Your borrowed-venue showcase is already complete.",
      embeds: [],
      components: [],
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🎧 BORROWED-VENUE SHOWCASE COMPLETE")
    .setDescription(choice.result)
    .addFields(
      {
        name: "⭐ Showcase Report",
        value:
          `**Overall:** ${choice.score}/100\n` +
          "This tutorial score introduces the same quality-over-crowd-size idea used by full Show Ratings.",
      },
      {
        name: "🎁 Community Backing",
        value:
          `**Cash:** +${money(cashReward)}\n` +
          `**XP:** +${choice.xp}\n` +
          `**Scene Reputation:** +${choice.sceneReputation}`,
      },
      {
        name: "🏚 Your First Permanent Room",
        value:
          "You now have enough backing for **Garage Party**. Buy it with `/buy_venue`, then use `/create_show` to produce your first owned event.",
      },
    );

  await interaction.update({ embeds: [embed], components: [] });
  await announceLevelUp(interaction, xpUpdate);
}

module.exports = { handleJourneyButton, journey };
