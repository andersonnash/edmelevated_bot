const db = require("../db");

const { EmbedBuilder } = require("discord.js");

const { addXp, announceLevelUp } = require("../services/xp");


async function createKandi(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const phrase = interaction.options.getString("phrase");
  const color = interaction.options.getString("color");

  db.prepare(
    `
    INSERT INTO kandi (
      creator_id,
      creator_username,
      phrase,
      color
    )
    VALUES (?, ?, ?, ?)
  `,
  ).run(userId, username, phrase, color);

  return interaction.reply(
    `🌈 **Kandi Created**\n\n` + `Phrase: **${phrase}**\n` + `Color: ${color}`,
  );
}

async function giveKandi(interaction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const receiver = interaction.options.getUser("user");
  const kandiId = interaction.options.getString("kandi");

  const kandi = db
    .prepare(
      `
      SELECT *
      FROM kandi
      WHERE id = ?
      AND creator_id = ?
    `,
    )
    .get(kandiId, userId);

  if (!kandi) {
    return interaction.reply({
      content: "You can only give kandi that you created.",
      ephemeral: true,
    });
  }

  db.prepare(
    `
    INSERT INTO kandi_gifts (
      kandi_id,
      giver_id,
      giver_username,
      receiver_id,
      receiver_username
    )
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(kandi.id, userId, username, receiver.id, receiver.username);

  const xpUpdate = addXp(interaction.user.id, 8);
  await announceLevelUp(interaction, xpUpdate);

  return interaction.reply(
    `🌈 **Kandi Given**\n\n` +
      `${username} gave ${receiver.username} kandi that says:\n` +
      `**${kandi.phrase}**\n` +
      `Color: ${kandi.color}`,
  );
}

async function myKandi(interaction) {
  const userId = interaction.user.id;

  const created = db
    .prepare(
      `
      SELECT phrase, color
      FROM kandi
      WHERE creator_id = ?
    `,
    )
    .all(userId);

  const received = db
    .prepare(
      `
      SELECT
        kandi.phrase,
        kandi.color,
        kandi_gifts.giver_username
      FROM kandi_gifts
      JOIN kandi
        ON kandi.id = kandi_gifts.kandi_id
      WHERE kandi_gifts.receiver_id = ?
    `,
    )
    .all(userId);

  const createdList = created.length
    ? created.map((k) => `• ${k.phrase} (${k.color})`).join("\n")
    : "None yet.";

  const receivedList = received.length
    ? received
        .map((k) => `• ${k.phrase} (${k.color}) from ${k.giver_username}`)
        .join("\n")
    : "None yet.";

  const embed = new EmbedBuilder()
  .setColor(0xff66cc)
  .setTitle("🌈 YOUR KANDI COLLECTION")
  .addFields(
    {
      name: "✨ Created",
      value: createdList,
    },
    {
      name: "🎁 Received",
      value: receivedList,
    },
  )
  .setFooter({
    text: "Use /create_kandi or /give_kandi",
  });

  return interaction.reply({
    embeds: [embed],
  });
}

module.exports = {
  createKandi,
  giveKandi,
  myKandi,
  announceLevelUp,
};
