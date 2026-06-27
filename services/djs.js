const db = require("../db");

function findOrCreateDjProfile(user) {
  const existing = db
    .prepare("SELECT * FROM dj_profiles WHERE user_id = ?")
    .get(user.id);

  if (existing) return existing;

  db.prepare(
    `
    INSERT INTO dj_profiles (
      user_id,
      username,
      dj_reputation,
      bookings,
      base_fee
    )
    VALUES (?, ?, 0, 0, 100)
  `,
  ).run(user.id, user.username);

  return db.prepare("SELECT * FROM dj_profiles WHERE user_id = ?").get(user.id);
}

function calculateDjBookingFee(profile) {
  return profile.base_fee + profile.dj_reputation * 10 + profile.bookings * 25;
}

function getDjLevel(reputation) {
  if (reputation >= 175) return 6;
  if (reputation >= 100) return 5;
  if (reputation >= 50) return 4;
  if (reputation >= 25) return 3;
  if (reputation >= 10) return 2;
  return 1;
}

function getDjTitle(level) {
  const titles = {
    1: "Bedroom DJ",
    2: "Local Opener",
    3: "Club Regular",
    4: "Scene Favorite",
    5: "Headliner",
    6: "Legend",
  };

  return titles[level] || "DJ";
}

function addDjReputation(userId, amount) {
  const before = db
    .prepare("SELECT * FROM dj_profiles WHERE user_id = ?")
    .get(userId);

  if (!before) return null;

  const oldLevel = getDjLevel(before.dj_reputation);
  const newReputation = before.dj_reputation + amount;
  const newLevel = getDjLevel(newReputation);

  db.prepare(
    `
    UPDATE dj_profiles
    SET
      dj_reputation = ?,
      bookings = bookings + 1
    WHERE user_id = ?
  `,
  ).run(newReputation, userId);

  const after = db
    .prepare("SELECT * FROM dj_profiles WHERE user_id = ?")
    .get(userId);

  return {
    profile: after,
    repGain: amount,
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    title: getDjTitle(newLevel),
  };
}

module.exports = {
  findOrCreateDjProfile,
  calculateDjBookingFee,
  addDjReputation,
  getDjLevel,
  getDjTitle,
};
