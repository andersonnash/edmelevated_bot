const db = require("../db");

function addCash(userId, amount) {
  if (!amount) return;

  db.prepare(
    `
    UPDATE users
    SET
      cash = cash + ?,
      lifetime_earned = lifetime_earned + ?
    WHERE discord_id = ?
  `,
  ).run(amount, Math.max(amount, 0), userId);
}

function trackEarnings(userId, amount) {
  if (!amount || amount <= 0) return;

  db.prepare(
    `
    UPDATE users
    SET lifetime_earned = COALESCE(lifetime_earned, 0) + ?
    WHERE discord_id = ?
  `,
  ).run(amount, userId);
}

function addPendingPayout(userId, sourceName, amount) {
  if (!amount || amount <= 0) return;

  db.prepare(
    `
    INSERT INTO rave_payouts (
      user_id,
      show_id,
      show_name,
      profit,
      collected
    )
    VALUES (?, NULL, ?, ?, 0)
  `,
  ).run(userId, sourceName, amount);

  trackEarnings(userId, amount);
}

module.exports = {
  addCash,
  trackEarnings,
  addPendingPayout
};
