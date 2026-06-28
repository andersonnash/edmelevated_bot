const db = require("../db");

const { EmbedBuilder } = require("discord.js");

function getLevelFromXp(xp) {
  if (xp <= 0) return 1;

  return Math.floor(Math.sqrt(xp / 50)) + 1;
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
    11: "Rave Tycoon",
    12: "Underground King",
    13: "Festival Mogul",
    14: "Global Icon",
    15: "Music Deity",
  };

  return titles[level] || `Legend Lvl ${level}`;
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

  const stmt = db.prepare(
    `UPDATE users SET xp = ?, level = ? WHERE discord_id = ?`,
  );
  const info = stmt.run(newXp, newLevel, userId);

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
