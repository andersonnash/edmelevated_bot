const db = require("../db");

const { EmbedBuilder } = require("discord.js");

function getLevelFromXp(xp) {
  if (xp >= 5000) return 10;
  if (xp >= 3500) return 9;
  if (xp >= 2500) return 8;
  if (xp >= 1750) return 7;
  if (xp >= 1100) return 6;
  if (xp >= 700) return 5;
  if (xp >= 400) return 4;
  if (xp >= 200) return 3;
  if (xp >= 75) return 2;
  return 1;
}

function getLevelTitle(level) {
  const titles = {
    1: "New Raver",
    2: "Dancefloor Regular",
    3: "Scene Supporter",
    4: "Street Team",
    5: "Promoter",
    6: "Venue Insider",
    7: "Scene Builder",
    8: "Local Legend",
    9: "City Icon",
    10: "EDMELEVATED Elite",
  };

  return titles[level] || "Raver";
}

async function announceLevelUp(interaction, xpUpdate) {
  if (!xpUpdate?.leveledUp) return;

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🌟 LEVEL UP")
    .setDescription(
      `**${interaction.user.username}** leveled up in the EDMELEVATED scene.`,
    )
    .addFields(
      {
        name: "🏆 New Title",
        value: `**${xpUpdate.title}**`,
        inline: true,
      },
      {
        name: "📈 Level",
        value: `${xpUpdate.oldLevel} → **${xpUpdate.newLevel}**`,
        inline: true,
      },
      {
        name: "✨ Total XP",
        value: `${xpUpdate.totalXp}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Keep building the scene.",
    });

  return interaction.channel.send({
    embeds: [embed],
  });
}

function addXp(userId, amount) {
  const user = db
    .prepare("SELECT * FROM users WHERE discord_id = ?")
    .get(userId);

  if (!user) return null;

  const oldLevel = user.level || getLevelFromXp(user.xp || 0);
  const newXp = (user.xp || 0) + amount;
  const newLevel = getLevelFromXp(newXp);

  db.prepare(
    `
    UPDATE users
    SET xp = ?, level = ?
    WHERE discord_id = ?
  `,
  ).run(newXp, newLevel, userId);

  return {
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    xpGain: amount,
    totalXp: newXp,
    title: getLevelTitle(newLevel),
  };
}

function xpBar(currentXp, level) {
  const required = level * 500;

  const progress = Math.min(currentXp / required, 1);

  const totalBars = 16;

  const filled = Math.round(progress * totalBars);

  return "🟪".repeat(filled) + "⬛".repeat(totalBars - filled);
}

module.exports = {
  addXp,
  getLevelFromXp,
  getLevelTitle,
  announceLevelUp,
  xpBar,
};
