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
  APPROACHES,
  SCENARIOS,
  entryForCash,
  resolveEncounter,
  scaledPayout,
  scenarioChoices,
} = require("../services/undergroundRunRules");
const { addXp, announceLevelUp } = require("../services/xp");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function completedToday(userId) {
  return db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM underground_run_history
       WHERE user_id = ?
         AND date(completed_at) = date('now')`,
    )
    .get(userId).count;
}

function activeState(userId) {
  return db
    .prepare("SELECT * FROM underground_run_state WHERE user_id = ?")
    .get(userId);
}

function scenarioRow() {
  return new ActionRowBuilder().addComponents(
    ...scenarioChoices().map((scenario) =>
      new ButtonBuilder()
        .setCustomId(`underground_run:scenario:${scenario.key}`)
        .setLabel(scenario.title)
        .setEmoji(scenario.emoji)
        .setStyle(ButtonStyle.Primary),
    ),
  );
}

function approachRow() {
  return new ActionRowBuilder().addComponents(
    ...Object.values(APPROACHES).map((approach) =>
      new ButtonBuilder()
        .setCustomId(`underground_run:approach:${approach.key}`)
        .setLabel(approach.label)
        .setEmoji(approach.emoji)
        .setStyle(
          approach.key === "risky" ? ButtonStyle.Danger : ButtonStyle.Primary,
        ),
    ),
  );
}

function payoutRateText(userId) {
  const payout = scaledPayout(0, 0, completedToday(userId));
  return `${Math.round(payout.multiplier * 100)}%`;
}

function selectionEmbed(state, userId) {
  return new EmbedBuilder()
    .setColor(0xa855f7)
    .setTitle("🌃 CHOOSE AN UNDERGROUND RUN")
    .setDescription(
      "Pick one situation to follow tonight. Each scenario becomes a short active story, then ends with one risk decision and an immediate result.",
    )
    .addFields(
      {
        name: "Tonight's Stake",
        value:
          `**${money(state.entry_paid)}** is temporarily at risk.\n` +
          "Only this $25 stake is at risk. You cannot lose any additional cash.",
        inline: true,
      },
      {
        name: "Today's Payout Rate",
        value:
          `**${payoutRateText(userId)}**\n` +
          "Runs 1–3: 100% • 4–6: 60% • Later: 40%",
        inline: true,
      },
      {
        name: "No Cooldown",
        value:
          "After the scenario ends, start another run or return to the rest of the city.",
      },
    );
}

function decisionEmbed(scenario, userId) {
  return new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(`${scenario.emoji} ${scenario.title.toUpperCase()}`)
    .setDescription(scenario.beats[scenario.beats.length - 1])
    .addFields(
      {
        name: "Choose the Ending",
        value:
          "🧠 **Play It Safe** — $30–$55 • 3 XP • 5% bust risk\n" +
          "⚡ **Take the Opportunity** — $60–$105 • 5 XP • 15% bust risk\n" +
          "🔥 **Push Your Luck** — $115–$190 • 8 XP • 35% bust risk",
      },
      {
        name: "Today's Payout Rate",
        value: `Rewards settle at **${payoutRateText(userId)}** when this scenario ends.`,
      },
    )
    .setFooter({ text: "One decision ends the run • No Scene Reputation awarded" });
}

async function undergroundRun(interaction) {
  const userId = interaction.user.id;
  let state = activeState(userId);

  if (!state) {
    const user = db
      .prepare("SELECT cash FROM users WHERE discord_id = ?")
      .get(userId);
    const entry = entryForCash(user.cash);
    const start = db.transaction(() => {
      if (entry > 0) {
        db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
          entry,
          userId,
        );
      }
      db.prepare(
        `INSERT INTO underground_run_state
          (user_id, round, stash, xp_stash, entry_paid, scenario_key, phase)
         VALUES (?, 1, ?, 0, ?, NULL, 'choose')`,
      ).run(userId, entry, entry);
    });
    start();
    state = activeState(userId);
  }

  if (
    (state.phase === "decision" || state.phase === "story") &&
    SCENARIOS[state.scenario_key]
  ) {
    if (state.phase === "story") {
      db.prepare(
        "UPDATE underground_run_state SET phase = 'decision' WHERE user_id = ?",
      ).run(userId);
    }
    return interaction.reply({
      embeds: [decisionEmbed(SCENARIOS[state.scenario_key], userId)],
      components: [approachRow()],
    });
  }

  return interaction.reply({
    embeds: [selectionEmbed(state, userId)],
    components: [scenarioRow()],
  });
}

async function playScenario(interaction, state, scenario) {
  db.prepare(
    `UPDATE underground_run_state
     SET scenario_key = ?, phase = 'story'
     WHERE user_id = ?`,
  ).run(scenario.key, interaction.user.id);

  for (let index = 0; index < scenario.beats.length; index += 1) {
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(`${scenario.emoji} ${scenario.title.toUpperCase()}`)
      .setDescription(scenario.beats[index])
      .addFields({
        name: "Story Progress",
        value: `${"▰".repeat(index + 1)}${"▱".repeat(scenario.beats.length - index - 1)}`,
      });

    if (index === 0) {
      await interaction.update({ embeds: [embed], components: [] });
    } else {
      await interaction.editReply({ embeds: [embed], components: [] });
    }

    await sleep(1200);
  }

  db.prepare(
    "UPDATE underground_run_state SET phase = 'decision' WHERE user_id = ?",
  ).run(interaction.user.id);

  return interaction.editReply({
    embeds: [decisionEmbed(scenario, interaction.user.id)],
    components: [approachRow()],
  });
}

async function resolveScenario(interaction, state, scenario, approachKey) {
  const outcome = resolveEncounter(approachKey);
  if (!outcome) {
    return interaction.reply({ content: "That approach is unavailable.", ephemeral: true });
  }

  const payout = scaledPayout(
    outcome.busted ? 0 : state.stash + outcome.cashGain,
    outcome.xpGain,
    completedToday(interaction.user.id),
    outcome.busted ? 0 : state.entry_paid,
  );
  let xpUpdate;

  const settle = db.transaction(() => {
    const current = activeState(interaction.user.id);
    if (!current || current.phase !== "decision") return false;

    if (payout.cash > 0) addCash(interaction.user.id, payout.cash);
    xpUpdate = addXp(interaction.user.id, payout.xp);
    db.prepare("DELETE FROM underground_run_state WHERE user_id = ?").run(
      interaction.user.id,
    );
    db.prepare(
      `INSERT INTO underground_run_history
        (user_id, result, rounds_completed, cash_paid, xp_paid)
       VALUES (?, ?, 1, ?, ?)`,
    ).run(
      interaction.user.id,
      outcome.busted ? "busted" : approachKey,
      payout.cash,
      payout.xp,
    );
    return true;
  });

  if (!settle()) {
    return interaction.update({
      content: "That Underground Run is already complete.",
      embeds: [],
      components: [],
    });
  }

  const resultText = outcome.busted
    ? scenario.bust
    : scenario.success[approachKey];
  const embed = new EmbedBuilder()
    .setColor(outcome.busted ? 0xef4444 : 0x22c55e)
    .setTitle(
      outcome.busted
        ? `💥 ${scenario.title.toUpperCase()} FELL APART`
        : `✅ ${scenario.title.toUpperCase()} COMPLETE`,
    )
    .setDescription(resultText)
    .addFields({
      name: "Final Result",
      value:
        `**Cash Banked:** ${money(payout.cash)}\n` +
        `**XP Banked:** ${payout.xp}\n` +
        `**Risk Taken:** ${outcome.approach.label}\n` +
        `**Payout Rate:** ${Math.round(payout.multiplier * 100)}%`,
    })
    .setFooter({
      text: "Run complete • Start another /underground_run or return to the city",
    });

  await interaction.update({ embeds: [embed], components: [] });
  await announceLevelUp(interaction, xpUpdate);
}

async function handleUndergroundRunButton(interaction) {
  const [, actionType, actionKey] = interaction.customId.split(":");
  const state = activeState(interaction.user.id);

  if (!state) {
    return interaction.update({
      content: "That run is no longer active. Use `/underground_run` to start another.",
      embeds: [],
      components: [],
    });
  }

  if (actionType === "scenario") {
    const scenario = SCENARIOS[actionKey];
    if (!scenario || state.phase !== "choose") {
      return interaction.update({
        content: "That scenario is no longer available.",
        embeds: [],
        components: [],
      });
    }
    return playScenario(interaction, state, scenario);
  }

  if (actionType === "approach") {
    const scenario = SCENARIOS[state.scenario_key];
    if (!scenario || state.phase !== "decision") {
      return interaction.update({
        content: "Finish choosing and viewing a scenario first.",
        embeds: [],
        components: [],
      });
    }
    return resolveScenario(interaction, state, scenario, actionKey);
  }

  return interaction.reply({ content: "That run action is unavailable.", ephemeral: true });
}

module.exports = { handleUndergroundRunButton, undergroundRun };
