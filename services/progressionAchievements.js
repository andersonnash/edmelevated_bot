const db = require("../db");
const { addRole } = require("./roles");
const { achievementNames } = require("./progressionRules");

const ACTIVITY_COLUMNS = new Set([
  "crate_digs",
  "street_team_runs",
  "rave_stories",
]);

function evaluateProgressionAchievements(userId) {
  const user = db
    .prepare("SELECT level, reputation FROM users WHERE discord_id = ?")
    .get(userId);
  if (!user) return [];

  const activities =
    db
      .prepare("SELECT * FROM user_activity_stats WHERE user_id = ?")
      .get(userId) || {};
  const unlocked = achievementNames({
    level: user.level,
    sceneReputation: user.reputation,
    activities,
  });
  unlocked.forEach((role) => addRole(userId, role));
  return unlocked;
}

function incrementActivity(userId, column) {
  if (!ACTIVITY_COLUMNS.has(column)) {
    throw new Error(`Unsupported activity counter: ${column}`);
  }

  db.prepare(
    `INSERT INTO user_activity_stats (user_id, ${column})
     VALUES (?, 1)
     ON CONFLICT(user_id) DO UPDATE SET ${column} = ${column} + 1`,
  ).run(userId);
  return evaluateProgressionAchievements(userId);
}

module.exports = {
  evaluateProgressionAchievements,
  incrementActivity,
};
