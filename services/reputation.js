const db = require("../db");
const { evaluateProgressionAchievements } = require("./progressionAchievements");

function addSceneReputation(userId, amount) {
  if (!amount) return;
  db.prepare(
    "UPDATE users SET reputation = reputation + ? WHERE discord_id = ?",
  ).run(amount, userId);
  evaluateProgressionAchievements(userId);
}

module.exports = { addSceneReputation };
