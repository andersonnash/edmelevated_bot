const db = require("../db");

function getUser(userId) {
  return db.prepare("SELECT * FROM users WHERE discord_id = ?").get(userId);
}

function addRole(userId, role) {
  const existing = db
    .prepare(
      `
      SELECT *
      FROM user_roles
      WHERE user_id = ?
      AND role = ?
    `,
    )
    .get(userId, role);

  if (!existing) {
    db.prepare(
      `
        INSERT INTO user_roles (
          user_id,
          role
        )
        VALUES (?, ?)
      `,
    ).run(userId, role);
  }
}

module.exports = {
  getUser,
  addRole,
};
