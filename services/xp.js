const db = require("../db");

const { EmbedBuilder } = require("discord.js");
const { evaluateProgressionAchievements } = require("./progressionAchievements");
const { getLevelFromXp, getLevelTitle } = require("./xpMath");

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

  const stmt = db.prepare(
    `UPDATE users SET xp = ?, level = ? WHERE discord_id = ?`,
  );
  const info = stmt.run(newXp, newLevel, userId);
  evaluateProgressionAchievements(userId);

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
  const nextLevelXp = Math.pow(level, 2) * 50;
  const prevLevelXp = Math.pow(level - 1, 2) * 50;

  const range = nextLevelXp - prevLevelXp;
  const progress = currentXp - prevLevelXp;

  const percent = Math.min(progress / range, 1);
  const totalBars = 16;
  const filled = Math.round(percent * totalBars);

  return "🟪".repeat(filled) + "⬛".repeat(totalBars - filled);
}

module.exports = {
  addXp,
  getLevelFromXp,
  getLevelTitle,
  announceLevelUp,
  xpBar,
};
